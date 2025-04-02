import numpy as np
import matplotlib.pyplot as plt
from sklearn.linear_model import LinearRegression

# 生成示例資料
x = np.array([[5], [15], [25], [35], [45], [55]])
y = np.array([5, 20, 14, 32, 22, 38])

# 創建並訓練模型
model = LinearRegression()
model.fit(x, y)

# 預測
x_new = np.array([[5], [15], [25], [35], [45], [55]])
y_pred = model.predict(x_new)

# 可視化結果
plt.scatter(x, y, color="blue")
plt.plot(x, y_pred, color="red")
plt.xlabel("特徵 x")
plt.ylabel("目標 y")
plt.title("簡單線性回歸範例")
plt.show()
