# 计算K值从1到10对应的平均畸变程度(肘部法则)
from sklearn.cluster import KMeans
from scipy.spatial.distance import cdist
import matplotlib.pyplot as plt
import numpy as np

# 载入数据
data = np.genfromtxt(r'E:\dissertation\data\项目数据\我的数据\樊庄_属性_百度坐标_509_插值_pca5.csv',
                     delimiter=',', skip_header=1, usecols=(26, 27, 28, 29, 30), encoding='utf-8')
K = range(1, 11)
meandistortions = []
for k in K:
    kmeans = KMeans(n_clusters=k)
    kmeans.fit(data)
    meandistortions.append(sum(np.min(
        cdist(data, kmeans.cluster_centers_, 'euclidean'), axis=1))/data.shape[0])
plt.plot(K, meandistortions, 'bx-')
plt.xlabel('k')
plt.ylabel(u'平均畸变程度', fontproperties='SimHei')
plt.title(u'用肘部法则来确定最佳的K值', fontproperties='SimHei')
plt.show()
