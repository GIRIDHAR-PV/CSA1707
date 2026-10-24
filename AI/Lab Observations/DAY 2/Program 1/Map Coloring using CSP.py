regions = ["A", "B", "C", "D"]
colors = ["Red", "Green", "Blue"]

neighbors = {
    "A": ["B", "C"],
    "B": ["A", "C", "D"],
    "C": ["A", "B", "D"],
    "D": ["B", "C"]
}

assignment = {}

def is_safe(region, color):
    for neighbor in neighbors[region]:
        if assignment.get(neighbor) == color:
            return False
    return True

def solve(index):
    if index == len(regions):
        return True

    region = regions[index]

    for color in colors:
        if is_safe(region, color):
            assignment[region] = color

            if solve(index + 1):
                return True

            del assignment[region]

    return False

if solve(0):
    print("Map Coloring Solution:")
    for region in regions:
        print(region, ":", assignment[region])
else:
    print("No solution")
