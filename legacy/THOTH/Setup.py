from distutils.core import setup, Extension

module = Extension('main', sources = ['main.c'])

setup (name = 'PackageName',
       version = '1.0',
       description = 'This is a package for main module',
       ext_modules = [module])
