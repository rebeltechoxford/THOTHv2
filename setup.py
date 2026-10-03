"""Build the actual C++ extension; THOTH_OPENMP=0 selects a serial build."""
import os
import sys
from setuptools import setup
from pybind11.setup_helpers import Pybind11Extension, build_ext

openmp = os.environ.get("THOTH_OPENMP", "0" if sys.platform == "darwin" else "1") == "1"
compile_args, link_args = [], []
if openmp:
    if sys.platform == "win32":
        compile_args = ["/openmp"]
    else:
        compile_args = ["-fopenmp"]
        link_args = ["-fopenmp"]
setup(
    ext_modules=[Pybind11Extension("thoth._native", ["native/bindings.cpp"], cxx_std=17,
                                 depends=["native/research.hpp"],
                                 extra_compile_args=compile_args, extra_link_args=link_args)],
    cmdclass={"build_ext": build_ext},
)
