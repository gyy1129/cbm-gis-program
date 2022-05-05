# -*- coding: utf-8 -*-
import tensorflow as tf
import pandas as pd
import numpy as np
import math
import os
import numpy.linalg as la
from sklearn.metrics import mean_squared_error, mean_absolute_error
import matplotlib.pyplot as plt
import scipy.sparse as sp
from tensorflow.contrib.rnn import RNNCell
import time
import sys
import io
# print(sys.argv)
adjFile = sys.argv[1]
timeFile = sys.argv[2]
trainTime = int(sys.argv[3])

# 解决 输出到nodejs中乱码
sys.stdout = io.TextIOWrapper(sys.stdout.detach(), encoding='utf-8')

# ----------------------------------- input_data.py -----------------------------------


def load_well_data(dataset):
    well_adj = pd.read_csv('./public/'+adjFile+'.csv', header=None)
    adj = np.mat(well_adj)
    well_tf = pd.read_csv('./public/'+timeFile+'.csv')
    return well_tf, adj


def preprocess_data(data, time_len, rate, seq_len, pre_len):
    train_size = int(time_len * rate)
    train_data = data[0:train_size]
    test_data = data[train_size:time_len]

    trainX, trainY, testX, testY = [], [], [], []
    for i in range(len(train_data) - seq_len - pre_len):
        a = train_data[i: i + seq_len + pre_len]
        trainX.append(a[0: seq_len])
        trainY.append(a[seq_len: seq_len + pre_len])
    for i in range(len(test_data) - seq_len - pre_len):
        b = test_data[i: i + seq_len + pre_len]
        testX.append(b[0: seq_len])
        testY.append(b[seq_len: seq_len + pre_len])

    trainX1 = np.array(trainX)
    trainY1 = np.array(trainY)
    testX1 = np.array(testX)
    testY1 = np.array(testY)
    return trainX1, trainY1, testX1, testY1


# ----------------------------------- utils.py -----------------------------------
def normalized_adj(adj):
    adj = sp.coo_matrix(adj)
    rowsum = np.array(adj.sum(1))
    d_inv_sqrt = np.power(rowsum, -0.5).flatten()
    d_inv_sqrt[np.isinf(d_inv_sqrt)] = 0.
    d_mat_inv_sqrt = sp.diags(d_inv_sqrt)
    normalized_adj = adj.dot(d_mat_inv_sqrt).transpose().dot(
        d_mat_inv_sqrt).tocoo()
    normalized_adj = normalized_adj.astype(np.float32)
    return normalized_adj


def sparse_to_tuple(mx):
    mx = mx.tocoo()
    coords = np.vstack((mx.row, mx.col)).transpose()
    L = tf.SparseTensor(coords, mx.data, mx.shape)
    return tf.sparse.reorder(L)


def calculate_laplacian(adj, lambda_max=1):
    adj = normalized_adj(adj + sp.eye(adj.shape[0]))
    adj = sp.csr_matrix(adj)
    adj = adj.astype(np.float32)
    return sparse_to_tuple(adj)


# ----------------------------------- tgcn.py -----------------------------------
class tgcnCell(RNNCell):
    def call(self, inputs, **kwargs):
        pass

    def __init__(self, num_units, adj, num_nodes, input_size=None,
                 act=tf.nn.tanh, reuse=None):
        super(tgcnCell, self).__init__(_reuse=reuse)
        self._act = act
        self._nodes = num_nodes
        self._units = num_units
        self._adj = []
        self._adj.append(calculate_laplacian(adj))

    @property
    def state_size(self):
        return self._nodes * self._units

    @property
    def output_size(self):
        return self._units

    def __call__(self, inputs, state, scope=None):
        with tf.compat.v1.variable_scope(scope or "tgcn"):
            with tf.compat.v1.variable_scope("gates"):
                value = tf.nn.sigmoid(
                    self._gc(inputs, state, 2 * self._units, bias=1.0, scope=scope))
                r, u = tf.split(value=value, num_or_size_splits=2, axis=1)
            with tf.compat.v1.variable_scope("candidate"):
                r_state = r * state
                c = self._act(self._gc(inputs, r_state,
                              self._units, scope=scope))
            new_h = u * state + (1 - u) * c
        return new_h, new_h

    def _gc(self, inputs, state, output_size, bias=0.0, scope=None):
        # inputs:(-1,num_nodes)
        inputs = tf.expand_dims(inputs, 2)
        # state:(batch,num_node,gru_units)
        state = tf.reshape(state, (-1, self._nodes, self._units))
        # concat
        x_s = tf.concat([inputs, state], axis=2)
        input_size = x_s.get_shape()[2].value
        # (num_node,input_size,-1)
        x0 = tf.transpose(x_s, perm=[1, 2, 0])
        x0 = tf.reshape(x0, shape=[self._nodes, -1])

        scope = tf.compat.v1.get_variable_scope()
        with tf.compat.v1.variable_scope(scope):
            for m in self._adj:
                x1 = tf.sparse.sparse_dense_matmul(m, x0)
            #                print(x1)
            x = tf.reshape(x1, shape=[self._nodes, input_size, -1])
            x = tf.transpose(x, perm=[2, 0, 1])
            x = tf.reshape(x, shape=[-1, input_size])
            weights = tf.compat.v1.get_variable(
                'weights', [input_size, output_size], initializer=tf.contrib.layers.xavier_initializer())
            # (batch_size * self._nodes, output_size)
            x = tf.matmul(x, weights)
            biases = tf.compat.v1.get_variable(
                "biases", [output_size], initializer=tf.constant_initializer(bias, dtype=tf.float32))
            x = tf.nn.bias_add(x, biases)
            x = tf.reshape(x, shape=[-1, self._nodes, output_size])
            x = tf.reshape(x, shape=[-1, self._nodes * output_size])
        return x

# ----------------------------------- visualization.py -----------------------------------


def plot_result(test_result, test_label1, path):
    # all test result visualization
    fig1 = plt.figure(figsize=(8, 3))
#    ax1 = fig1.add_subplot(1,1,1)
    a_pred = test_result[:, 0]
    a_true = test_label1[:, 0]
    plt.plot(a_pred, 'r-', label='prediction')
    plt.plot(a_true, 'b-', label='true')
    plt.legend(loc='best', fontsize=10)
    plt.savefig(path+'/test_all.jpg')
    # plt.show()
    # onewell test result visualization
    fig1 = plt.figure(figsize=(8, 3))
#    ax1 = fig1.add_subplot(1,1,1)
    a_pred = test_result[0:90, 0]
    a_true = test_label1[0:90, 0]
    plt.plot(a_pred, 'r-', label="prediction")
    plt.plot(a_true, 'b-', label="true")
    plt.legend(loc='best', fontsize=10)
    plt.savefig(path+'/test_90day.jpg')
    # plt.show()


# ----------------------------------- main.py -----------------------------------
time_start = time.time()
###### Settings ######
flags = tf.app.flags
FLAGS = flags.FLAGS
flags.DEFINE_float('learning_rate', 0.001, 'Initial learning rate.')
flags.DEFINE_integer('training_epoch', trainTime, 'Number of epochs to train.')
flags.DEFINE_integer('gru_units', 64, 'hidden units of gru.')
flags.DEFINE_integer('seq_len', 6, '  time length of inputs.')
flags.DEFINE_integer('pre_len', 1, 'time length of prediction.')
flags.DEFINE_float('train_rate', 0.8, 'rate of training set.')
flags.DEFINE_integer('batch_size', 32, 'batch size.')
flags.DEFINE_string('dataset', 'well', 'well')
flags.DEFINE_string('model_name', 'tgcn', 'tgcn')
model_name = FLAGS.model_name
data_name = FLAGS.dataset
train_rate = FLAGS.train_rate
seq_len = FLAGS.seq_len
output_dim = pre_len = FLAGS.pre_len
batch_size = FLAGS.batch_size
lr = FLAGS.learning_rate
training_epoch = FLAGS.training_epoch
gru_units = FLAGS.gru_units

###### load data ######
if data_name == 'well':
    data, adj = load_well_data('well')

time_len = data.shape[0]
num_nodes = data.shape[1]
data1 = np.mat(data, dtype=np.float32)

# normalization
max_value = np.max(data1)
data1 = data1 / max_value
trainX, trainY, testX, testY = preprocess_data(
    data1, time_len, train_rate, seq_len, pre_len)

totalbatch = int(trainX.shape[0] / batch_size)
training_data_count = len(trainX)


def TGCN(_X, _weights, _biases):
    cell_1 = tgcnCell(gru_units, adj, num_nodes=num_nodes)
    cell = tf.nn.rnn_cell.MultiRNNCell([cell_1], state_is_tuple=True)
    _X = tf.unstack(_X, axis=1)
    outputs, states = tf.nn.static_rnn(cell, _X, dtype=tf.float32)
    m = []
    for i in outputs:
        o = tf.reshape(i, shape=[-1, num_nodes, gru_units])
        o = tf.reshape(o, shape=[-1, gru_units])
        m.append(o)
    last_output = m[-1]
    output = tf.matmul(last_output, _weights['out']) + _biases['out']
    output = tf.reshape(output, shape=[-1, num_nodes, pre_len])
    output = tf.transpose(output, perm=[0, 2, 1])
    output = tf.reshape(output, shape=[-1, num_nodes])
    return output, m, states


###### placeholders占位符 ######
inputs = tf.compat.v1.placeholder(tf.float32, shape=[None, seq_len, num_nodes])
labels = tf.compat.v1.placeholder(tf.float32, shape=[None, pre_len, num_nodes])

# Graph weights
weights = {
    'out': tf.Variable(tf.random.normal([gru_units, pre_len], mean=1.0), name='weight_o')}
biases = {
    'out': tf.Variable(tf.random.normal([pre_len]), name='bias_o')}

if model_name == 'tgcn':
    pred, ttts, ttto = TGCN(inputs, weights, biases)

y_pred = pred

###### optimizer ######
lambda_loss = 0.0015
Lreg = lambda_loss * sum(tf.nn.l2_loss(tf_var)
                         for tf_var in tf.compat.v1.trainable_variables())
label = tf.reshape(labels, [-1, num_nodes])
# loss
loss = tf.reduce_mean(tf.nn.l2_loss(y_pred - label) + Lreg)
# rmse
error = tf.sqrt(tf.reduce_mean(tf.square(y_pred - label)))
optimizer = tf.compat.v1.train.AdamOptimizer(lr).minimize(loss)

###### Initialize session ######
variables = tf.compat.v1.global_variables()
saver = tf.compat.v1.train.Saver(tf.compat.v1.global_variables())
# sess = tf.Session()
gpu_options = tf.compat.v1.GPUOptions(per_process_gpu_memory_fraction=0.333)
sess = tf.compat.v1.Session(
    config=tf.compat.v1.ConfigProto(gpu_options=gpu_options))
sess.run(tf.compat.v1.global_variables_initializer())

path = 'output/%s' % (model_name)
if not os.path.exists(path):
    os.makedirs(path)


###### evaluation ######
def evaluation(a, b):
    rmse = math.sqrt(mean_squared_error(a, b))
    mae = mean_absolute_error(a, b)
    F_norm = la.norm(a - b, 'fro') / la.norm(a, 'fro')
    r2 = 1 - ((a - b) ** 2).sum() / ((a - a.mean()) ** 2).sum()
    var = 1 - (np.var(a - b)) / np.var(a)
    return rmse, mae, 1 - F_norm, r2, var

####### 修改添加函数 ######


def update(test_label):
    row = test_label.shape[0]
    col = test_label.shape[1]
    new_row = int((row - (1 + 6) * 6 / 2 * 2) / output_dim)
    new_test_label = np.zeros(shape=(new_row + 6 * 2, col))
    # 前六个日期
    new_test_label[0][:] = test_label[0][:]
    new_test_label[-1][:] = test_label[-1][:]
    for i in range(col):
        new_test_label[1][i] = (test_label[1][i] + test_label[1 + 6][i]) / 2
        new_test_label[-2][i] = (test_label[-2][i] + test_label[-2 - 6][i]) / 2
        new_test_label[2][i] = (
            test_label[2][i] + test_label[2 + 6][i] + test_label[2 + 6 * 2][i]) / 3
        new_test_label[-3][i] = (test_label[-3][i] +
                                 test_label[-3 - 6][i] + test_label[-3 - 6 * 2][i]) / 3
        new_test_label[3][i] = (test_label[3][i] + test_label[3 + 6]
                                [i] + test_label[3 + 6 * 2][i] + test_label[3 + 6 * 3][i]) / 4
        new_test_label[-4][i] = (test_label[-4][i] + test_label[-4 - 6]
                                 [i] + test_label[-4 - 6 * 2][i] + test_label[-4 - 6 * 3][i]) / 4
        new_test_label[4][i] = (test_label[4][i] + test_label[4 + 6][i] + test_label[4 + 6 * 2]
                                [i] + test_label[4 + 6 * 3][i] + test_label[4 + 6 * 4][i]) / 5
        new_test_label[-5][i] = (test_label[-5][i] + test_label[-5 - 6][i] + test_label[-5 - 6 * 2]
                                 [i] + test_label[-5 - 6 * 3][i] + test_label[-5 - 6 * 4][i]) / 5
        new_test_label[5][i] = (test_label[5][i] + test_label[5 + 6][i] + test_label[5 + 6 * 2]
                                [i] + test_label[5 + 6 * 3][i] + test_label[5 + 6 * 4][i] + test_label[5 + 6 * 5][i]) / 6
        new_test_label[-6][i] = (test_label[-6][i] + test_label[-6 - 6][i] + test_label[-6 - 6 * 2]
                                 [i] + test_label[-6 - 6 * 3][i] + test_label[-6 - 6 * 4][i] + test_label[-6 - 6 * 5][i]) / 6

    # 后面（总数-(1+6)*6/2）日期
    c = 6
    for a in range(6, new_row * 7, 7):
        for b in range(col):
            new_test_label[c][b] = (test_label[a][b] + test_label[a + 6 * 1][b] + test_label[a + 6 * 2][b] +
                                    test_label[a + 6 * 3][b] + test_label[a + 6 * 4][b] + test_label[a + 6 * 5][b] +
                                    test_label[a + 6 * 6][b]) / 7
        c = c + 1
    return new_test_label


x_axe, batch_loss, batch_rmse, batch_pred = [], [], [], []
test_loss, test_rmse, test_mae, test_acc, test_r2, test_var, test_pred = [
], [], [], [], [], [], []

for epoch in range(training_epoch):
    for m in range(totalbatch):
        mini_batch = trainX[m * batch_size: (m + 1) * batch_size]
        mini_label = trainY[m * batch_size: (m + 1) * batch_size]
        _, loss1, rmse1, train_output = sess.run([optimizer, loss, error, y_pred],
                                                 feed_dict={inputs: mini_batch, labels: mini_label})
        batch_loss.append(loss1)
        batch_rmse.append(rmse1 * max_value)

    # Test completely at every epoch
    loss2, rmse2, test_output = sess.run([loss, error, y_pred],
                                         feed_dict={inputs: testX, labels: testY})
    test_label = np.reshape(testY, [-1, num_nodes])

    # 修改test_label和test_output
    new_test_label = update(test_label)
    new_test_output = update(test_output)
    test_label = new_test_label
    test_output = new_test_output
    # 修改结束

    rmse, mae, acc, r2_score, var_score = evaluation(test_label, test_output)
    test_label1 = test_label * max_value
    test_output1 = test_output * max_value
    test_loss.append(loss2)
    test_rmse.append(rmse * max_value)
    test_mae.append(mae * max_value)
    test_acc.append(acc)
    test_r2.append(r2_score)
    test_var.append(var_score)
    test_pred.append(test_output1)

    print('Iter:{}'.format(epoch),
          'train_rmse:{:.4} '.format(batch_rmse[-1]),
          'test_loss:{:.4} '.format(loss2),
          'test_rmse:{:.4} '.format(rmse),
          'test_mae:{:.4} '.format(mae),
          'test_acc:{:.4} '.format(acc),
          'test_r2:{:.4} '.format(r2_score),
          'test_var:{:.4} '.format(var_score),
          )

    # if (epoch % 500 == 0):
    #     saver.save(sess, path + '/model_100/TGCN_pre_%r' % epoch, global_step=epoch)

time_end = time.time()
print()
# print('模型运行时间：', time_end - time_start, 's')
print()

############## visualization ###############
b = int(len(batch_rmse) / totalbatch)
batch_rmse1 = [i for i in batch_rmse]
train_rmse = [(sum(batch_rmse1[i * totalbatch:(i + 1) *
               totalbatch]) / totalbatch) for i in range(b)]
batch_loss1 = [i for i in batch_loss]
train_loss = [(sum(batch_loss1[i * totalbatch:(i + 1) *
               totalbatch]) / totalbatch) for i in range(b)]

index = test_rmse.index(np.min(test_rmse))
test_result = test_pred[index]
var = pd.DataFrame(test_result)
var.to_csv(path + '/test_result.csv', index=False, header=False)
plot_result(test_result, test_label1, path)
# plot_error(train_rmse,train_loss,test_rmse,test_acc,test_mae,path)

print(
    'ave_rmse:%r' % (np.mean(test_rmse)),
    'min_rmse:%r ' % (np.min(test_rmse)),
    'min_mae:%r ' % (test_mae[index]),
    'max_acc:%r ' % (test_acc[index]),
    'r2:%r ' % (test_r2[index]),
    'var:%r ' % test_var[index])
