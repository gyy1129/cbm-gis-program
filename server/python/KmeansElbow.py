# 计算K值从1到k对应的平均畸变程度(肘部法则)
from sklearn.cluster import KMeans
from scipy.spatial.distance import cdist
import numpy as np
import sys
# print(sys.argv)
maxk = int(sys.argv[1])
filename = sys.argv[2]

# 载入数据
data = np.genfromtxt('./public/'+filename+'.csv',
                     delimiter=',', skip_header=1, encoding='utf-8')
K = range(1, maxk+1)
meandistortions = []
for k in K:
    kmeans = KMeans(n_clusters=k)
    kmeans.fit(data)
    meandistortions.append(sum(np.min(
        cdist(data, kmeans.cluster_centers_, 'euclidean'), axis=1))/data.shape[0])
print(meandistortions)
