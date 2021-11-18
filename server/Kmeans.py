from sklearn.cluster import KMeans
import numpy as np

# 载入数据
data = np.genfromtxt(r'E:\dissertation\data\项目数据\我的数据\樊庄_属性_百度坐标_509_插值_pca5.csv',
                     delimiter=',', skip_header=1, usecols=(26, 27, 28, 29, 30), encoding='utf-8')
# 设置k值
k = 4

# 训练模型
model = KMeans(n_clusters=k)
model.fit(data)

# 预测结果
result = model.predict(data)
print("数据所属的类：\n", result, len(result))
