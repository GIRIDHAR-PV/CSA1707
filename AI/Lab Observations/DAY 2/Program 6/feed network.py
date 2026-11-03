
import numpy as np

inputs = np.array([1, 0])

weights1 = np.array([[0.2, 0.4],
                     [0.3, 0.5]])

weights2 = np.array([[0.6],
                     [0.7]])

hidden = np.dot(inputs, weights1)
hidden_output = 1 / (1 + np.exp(-hidden))

output = np.dot(hidden_output, weights2)
final_output = 1 / (1 + np.exp(-output))

print("Input:", inputs)
print("Hidden Layer Output:", hidden_output)
print("Final Output:", final_output)
