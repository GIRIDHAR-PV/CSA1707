
graph = {
    'A': [('B', 1), ('C', 3)],
    'B': [('D', 3), ('E', 1)],
    'C': [('F', 5)],
    'D': [],
    'E': [('F', 2)],
    'F': []
}

h = {
    'A': 5,
    'B': 4,
    'C': 4,
    'D': 3,
    'E': 1,
    'F': 0
}

start = 'A'
goal = 'F'

open_list = [(h[start], 0, start)]
visited = set()
parent = {}

while open_list:
    open_list.sort()
    f, g, node = open_list.pop(0)

    if node in visited:
        continue

    visited.add(node)

    if node == goal:
        break

    for neighbour, cost in graph[node]:
        new_g = g + cost

        if neighbour not in visited:
            parent[neighbour] = node
            open_list.append((new_g + h[neighbour], new_g, neighbour))

path = []
node = goal

while node != start:
    path.append(node)
    node = parent[node]

path.append(start)
path.reverse()

print("Shortest Path:", path)
print("Total Cost:", g)
