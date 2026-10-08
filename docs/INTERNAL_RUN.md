# Run THOTH internally, including on your phone

THOTH serves a compiled TypeScript/Three.js interface from Python's FastAPI
process. Python acquires observations and coordinates jobs; C++ computes the
fits, distance posteriors, radiative model families and indexed mesh geometry.
The phone submits experiments and renders the returned three-dimensional
evidence. Scientific calculations run on the server; the browser handles camera
movement and rendering, so the phone does not need Python or a compiler.

## Native development and the current Windows workstation

Docker is optional final packaging. Normal development and the current running
lab use the local Python environment, the native compiler, and the TypeScript
build directly. From the repository root:

```powershell
./scripts/start-lab.ps1
```

The launcher builds the TypeScript UI with `npm ci` and `npm run build`, creates
`.venv` if needed, imports an installed Visual Studio C++ compiler environment,
builds the native extension with `pip install -e '.[dev]'`, and serves on port
8765. It uses the existing Visual Studio 18 Build Tools on this workstation and
supports installations located through `vswhere`. A fresh machine needs Node.js
22.12 or newer, Python 3.10 or newer, Visual Studio C++ Build Tools, and a Windows
SDK. The compiler setup changes only the launcher's process environment.

The launcher prefers an existing `.venv-phone` environment, otherwise `.venv`.
Use `-EnvironmentName .venv` or `-EnvironmentName .venv-phone` to choose explicitly.
`-Python` chooses the interpreter when creating a new environment. On this
workstation, `.venv-phone` uses the installed Python 3.12 runtime already allowed
by the existing private-network firewall rules; the Python 3.10 installation
has an existing inbound block. No firewall rule was changed for the lab.

After building once, start without rebuilding:

```powershell
./scripts/start-lab.ps1 -SkipBuild
```

Leave the terminal running; `Ctrl+C` stops its server. An occupied port produces
a clear error without stopping another process. Choose `-Port 8766` if desired.
Use `-BindAddress 127.0.0.1` for access only on this computer. The default
`0.0.0.0` listens on the network for phone access. Open **http://localhost:8765**
on the workstation, or **http://SERVER-LAN-IP:8765** on a phone connected to the
same Wi-Fi/network. The script prints the local IPv4 candidates; select the
active Ethernet or Wi-Fi adapter. A server at `192.168.1.19` has phone address
`http://192.168.1.19:8765`.

Keep this lab on your trusted personal network. Any existing host firewall must
permit your intended private-network connection; the launcher does not change
firewall or router settings. C++ computation remains on the workstation, and
browser controls and plots remain usable on the phone.

For frontend work, run `npm run dev` in `frontend/` alongside the Python server.
The Vite development server proxies same-origin API calls to the local Python
port configured in `frontend/vite.config.mjs`. Use a compiled build for a single
phone URL served by Python.

Open `http://SERVER-LAN-IP:8765/#space-lab` for the three-dimensional observatory.
Its full angular atlas uses all catalog entries with usable coordinates. The
physical distance layer uses only acquired Gaia position candidates and their
conditional posterior intervals. Selecting a star with measured photometry
constructs relative radius/temperature families; changing their assumptions
shows why one light curve can support different three-dimensional envelopes.
V/I/K proxy curves are predictions to test with additional observations.
See [SPACE.md](SPACE.md) for the measured inputs, model equations and limits.

The phone browser needs WebGL rendering for the three-dimensional scene. The
same local URL continues to provide the catalog, numerical research and compute
interfaces. Large catalog responses are compressed by the Python server;
geometry still preserves every catalog entry rather than silently dropping
stars to fit a drawing limit.

This workstation has no Docker runtime installation. Its installed WSL
distributions use WSL1, and firmware virtualization is disabled. THOTH runs
directly here; optional Linux containers require a compatible runtime on a
machine that supports it.

## Optional Docker final build on an internal machine

Install Docker Engine with Compose on Linux, or Docker Desktop configured for
Linux containers on Windows/macOS. Build and start from the repository root:

```console
docker compose up --build --detach --wait
docker compose logs --follow observatory
```

Open **http://localhost:8765** on the server. On a phone connected to the same
network, open **http://SERVER-LAN-IP:8765**. For example, a server whose private IP
is `192.168.1.19` has phone address `http://192.168.1.19:8765`. Select the active
Ethernet or Wi-Fi address, since machines can have several network adapters.
PowerShell's `Get-NetIPConfiguration` and Linux's `ip address` show these addresses.

Optional Windows container launcher:

```powershell
./scripts/start-docker.ps1
./scripts/start-docker.ps1 -Cpus 6 -Memory 4g -Port 8765
```

Compose publishes to all host interfaces for phone access. Keep this deployment
on your trusted personal network; it has no Internet publishing configuration.
For access only on the server, set `THOTH_BIND=127.0.0.1` before launching. Any
existing host firewall must permit your intended private-network connection;
THOTH's launchers do not change firewall or router settings.

The default allocation is **4 CPUs, 2 GiB memory, and 256 processes/threads**.
Set `THOTH_CPUS`, `THOTH_MEMORY`, and `THOTH_NATIVE_THREADS` in the shell or a local
`.env` file to adjust it. `THOTH_PORT` controls the host port. Match the UI's
requested worker/thread counts to that allocation. An allocation limits resources;
it does not create more physical CPU cores. Avoid multiplying high worker counts
by high OpenMP thread counts. The local laboratory uses one native thread per
worker, while direct native fits can use OpenMP.

The image builds the frontend with Node 22 and the C++17/OpenMP extension with GCC
in separate build stages. The runtime contains Python 3.12, the compiled package,
the packaged catalog/light curves, libgomp, and Open MPI. It runs as user `thoth`
(UID 10001), with a read-only root filesystem, writable temporary memory, and a
persistent named volume at `/var/lib/thoth/cache` for archive photometry. Browser
assets, full angular atlas, bundled measured curves and acquired Gaia example
receipts work without a CDN or archive connection.
Other stars' linked light curves need archive access once, then use the cache.
Imported observations and saved research reports live in the same persistent
volume's `workspace/` directory (`THOTH_WORKSPACE_DIR`).
Gaia acquisition receipts are saved under `workspace/astrometry/`; each records
the source endpoint, query, retrieval time, response checksum and candidate
quality fields. A cone match is an unconfirmed association, not a verified star
identity. Live Gaia queries need archive connectivity; offline demonstrations
use the packaged receipts.

Inspect the image's real workload after startup:

```console
docker compose exec -T observatory python scripts/docker-smoke.py --mpi
docker compose exec -T observatory python -m thoth.cluster --local --workers 4 --tasks 24 --samples 800 --observations-limit 2400 --progress --output /tmp/local.json
docker compose exec -T observatory mpiexec --oversubscribe -n 4 python -m thoth.cluster --mpi --tasks 24 --samples 800 --observations-limit 2400 --output /tmp/mpi.json
docker compose cp observatory:/tmp/mpi.json ./mpi-report.json
```

Several MPI ranks in this image demonstrate real MPI communication on one host.
A Beowulf deployment across physical computers additionally needs a configured
multi-node MPI launcher or scheduler, reachable nodes, matching software, and
shared input/output arrangements. See [CLUSTER.md](CLUSTER.md) for decomposition,
hybrid MPI/OpenMP, honest measured speedup, and Slurm examples.

Stop the service while keeping downloaded photometry:

```console
docker compose down
```

GitHub's **Container build and real compute** workflow builds the complete image,
starts it with these Compose restrictions, checks packaged frontend assets,
executes native fits and actual worker processes, and runs two MPI ranks. It does
not publish an image or expose a public server.
It also computes an RK4 oscillator and its refined-step convergence check,
investigates real measured photometry, and checks persisted observation imports.
The same smoke run validates the complete 3D angular geometry, conditional
radius/temperature flux closure, unmeasured V/K predictions, a Gaia receipt and
the native distance posterior. These checks use bundled evidence, keeping the
final container validation independent of archive availability. Docker remains
an optional final packaging route; native development is the primary workflow.

The deployment uses Docker's documented [multi-stage builds](https://docs.docker.com/build/building/multi-stage/)
and [Compose service settings](https://docs.docker.com/reference/compose-file/services/).

Docker's CPU/memory restrictions apply only to the optional container launch.
The native development launcher runs the same engine and Python process
scheduler directly on the workstation.
