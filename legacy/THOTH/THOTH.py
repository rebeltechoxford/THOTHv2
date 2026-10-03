import numpy as np
import matplotlib.pyplot as plt
import matplotlib.image as mpimg
import main as pymod
import csv
table = []
with open('tables/test.csv') as f:
    #reader = csv.reader(f)
    #table = list(reader)
    for line in f:
        data = line.split()
        table.append(int(data[0]))
print(table)
for v in table:
    print(pymod.fib(v))
print(pymod.version())
img=mpimg.imread("star.jpg")
imgplot = plt.imshow(img)
plt.show()
print("Process Terminated")