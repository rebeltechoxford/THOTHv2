//
//  main.c
//  THOTH
//
//  Created by Jesse Sullivan on 3/8/17.
//
#include <Python.h>

int Cfib(int n)
{
    if (n < 2)
        return n;
    else
        return Cfib(n-1) + Cfib(n-2);
}

static PyObject* fib(PyObject* self, PyObject* args)
{
    int n;

    if (!PyArg_ParseTuple(args, "i", &n))
        return NULL;

    return Py_BuildValue("i", Cfib(n));
}

static PyObject* version(PyObject* self)
{
    return Py_BuildValue("s", "Version 3.5");
}

static PyMethodDef myMethods[] = {
    {"fib", fib, METH_VARARGS, "Calculate the Fibonacci numbers."},
    {"version", (PyCFunction)version, METH_NOARGS, "Returns the version."},
    {NULL, NULL, 0, NULL}
};

static struct PyModuleDef main = {
    PyModuleDef_HEAD_INIT,
    "main",
    "Fibonacci Module",
    -1,
    myMethods
};

PyMODINIT_FUNC PyInit_main(void)
{
    return PyModule_Create(&main);
}
