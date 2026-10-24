from sklearn.tree import DecisionTreeClassifier

# Features: [Study hours, Attendance percentage]
X = [
    [1, 40],
    [2, 50],
    [3, 60],
    [4, 70],
    [5, 80],
    [6, 90]
]

# 0 = Fail, 1 = Pass
y = [0, 0, 0, 1, 1, 1]

model = DecisionTreeClassifier(random_state=0)
model.fit(X, y)

study_hours = 5
attendance = 85

prediction = model.predict([[study_hours, attendance]])

if prediction[0] == 1:
    print("Prediction: Pass")
else:
    print("Prediction: Fail")
