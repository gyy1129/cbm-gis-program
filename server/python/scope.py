import pandas as pd
import numpy as np
import math
import sys
# print(sys.argv)
scope = int(sys.argv[1])
filename = sys.argv[2]

df = pd.read_csv('./public/'+filename+'.csv',
                 usecols=['坐标X', '坐标Y', '百度坐标lng', '百度坐标lat'])
num = df.shape[0]

allwell_pair = []
for i in range(num):
    x1 = df.iloc[i, 0]
    y1 = df.iloc[i, 1]
    for j in range(i+1, num):
        x2 = df.iloc[j, 0]
        y2 = df.iloc[j, 1]
        dis = math.sqrt((x1-x2)**2+(y1-y2)**2)
        if dis <= scope:
            well_pair = []
            # well_pair.append(i)
            well_pair.append(df.iloc[i, 2])
            well_pair.append(df.iloc[i, 3])
            # well_pair.append(j)
            well_pair.append(df.iloc[j, 2])
            well_pair.append(df.iloc[j, 3])
            allwell_pair.append(well_pair)

print(allwell_pair)
