import io
import pandas as pd
import numpy as np
import math
import sys
# print(sys.argv)
scope = int(sys.argv[1])
filename = sys.argv[2]

# 解决 输出到nodejs中乱码
sys.stdout = io.TextIOWrapper(sys.stdout.detach(), encoding='utf-8')

df = pd.read_csv('./public/'+filename+'.csv')
num = df.shape[0]

allwell_pair = []
allwell_pair_name = []
for i in range(num):
    x1 = df.iloc[i, 1]
    y1 = df.iloc[i, 2]
    for j in range(i+1, num):
        x2 = df.iloc[j, 1]
        y2 = df.iloc[j, 2]
        dis = math.sqrt((x1-x2)**2+(y1-y2)**2)
        if dis <= scope:
            well_pair = []
            well_pair.append(i)
            well_pair.append(j)
            allwell_pair.append(well_pair)
            well_pair_name = []
            well_pair_name.append(df.iloc[i, 0])
            well_pair_name.append(df.iloc[j, 0])
            allwell_pair_name.append(well_pair_name)

well_name = list(df['井名'])


print(well_name)
print(allwell_pair_name)

# 生成邻接矩阵
xy = np.zeros(shape=(num, num))

for row in allwell_pair:
    point1 = row[0]
    point2 = row[1]
    xy[point1][point2] = 1
    xy[point2][point1] = 1

# print(xy)
print(list(xy))
# df = pd.DataFrame(xy)
# print(df)
#
