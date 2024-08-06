import matplotlib.pyplot as plt

# Define the darker pastel colors
darker_colors = {
    "Darker Pastel Violet": "#9966CC",
    "Darker Pastel Blue": "#6699CC",
    "Darker Pastel Green": "#66B266",
    "Darker Pastel Yellow": "#FFCC66",
    "Darker Pastel Orange": "#FF9966",
    "Darker Pastel Red": "#FF6666",
}

# Create a figure and axis
fig, ax = plt.subplots(figsize=(8, 6))

# Plot each darker color as a rectangle with white text on top
for i, (color_name, color_hex) in enumerate(darker_colors.items()):
    ax.add_patch(plt.Rectangle((0, i), 1, 1, color=color_hex))
    ax.text(0.5, i + 0.5, color_name, ha='center', va='center', fontsize=14, color='white')

# Remove axes
ax.set_xlim(0, 1)
ax.set_ylim(0, len(darker_colors))
ax.axis('off')

plt.show()
