from collections import deque

start = (1, 2, 3,
         4, 0, 6,
         7, 5, 8)

goal = (1, 2, 3,
        4, 5, 6,
        7, 8, 0)


#8 PUZZLE PROBLEM

queue = deque([(start, [])])
visited = set()

while queue:
    state, path = queue.popleft()

    if state == goal:
        print("Solution found:")
        for step in path + [state]:
            print(step[0:3])
            print(step[3:6])
            print(step[6:9])
            print()
        break

    if state in visited:
        continue

    visited.add(state)
    zero = state.index(0)
    row = zero // 3
    col = zero % 3

    moves = [(-1, 0), (1, 0), (0, -1), (0, 1)]

    for dr, dc in moves:
        new_row = row + dr
        new_col = col + dc

        if 0 <= new_row < 3 and 0 <= new_col < 3:
            new_pos = new_row * 3 + new_col
            new_state = list(state)

            new_state[zero], new_state[new_pos] = (
                new_state[new_pos], new_state[zero]
            )

            queue.append((tuple(new_state), path + [state]))
else:
    print("No solution found.")
