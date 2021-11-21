from sklearn.cluster import KMeans
import numpy as np
import sys

bestk = int(sys.argv[1])
filename = sys.argv[2]

# 载入数据
data = np.genfromtxt('./public/'+filename+'.csv',
                     delimiter=',', skip_header=1, encoding='utf-8')
# 设置k值
k = bestk

# 训练模型
model = KMeans(n_clusters=k)
model.fit(data)

# 预测结果
result = model.predict(data)
print(list(result))
