def minimax(depth, index, maximizing, scores, max_depth):
    if depth == max_depth:
        return scores[index]

    if maximizing:
        left = minimax(depth + 1, index * 2,
                       False, scores, max_depth)
        right = minimax(depth + 1, index * 2 + 1,
                        False, scores, max_depth)
        return max(left, right)

    else:
        left = minimax(depth + 1, index * 2,
                       True, scores, max_depth)
        right = minimax(depth + 1, index * 2 + 1,
                        True, scores, max_depth)
        return min(left, right)

scores = [3, 5, 2, 9, 12, 5, 23, 23]
max_depth = 3

result = minimax(0, 0, True, scores, max_depth)

print("Best value:", result)
