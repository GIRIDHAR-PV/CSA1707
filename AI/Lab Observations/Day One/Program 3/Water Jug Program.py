from collections import deque

capacity1 = 4
capacity2 = 3
target = 2

queue = deque([((0, 0), [])])
visited = set()

while queue:
    (a, b), path = queue.popleft()

    if (a, b) in visited:
        continue

    visited.add((a, b))
    path = path + [(a, b)]

    if a == target or b == target:
        print("Solution steps:")
        for state in path:
            print(state)
        break

    transfer = min(a, capacity2 - b)
    transfer2 = min(b, capacity1 - a)

    next_states = [
        (capacity1, b),
        (a, capacity2),
        (0, b),
        (a, 0),
        (a - transfer, b + transfer),
        (a + transfer2, b - transfer2)
    ]

    for state in next_states:
        if state not in visited:
            queue.append((state, path))
