export function EmptyComponent() {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyEmoji}>⏳</Text>
  
        <Text style={styles.emptyTitle}>Nothing here yet</Text>
  
        <Text style={styles.emptySubtitle}>
          Start tracking the things that matter.
        </Text>
  
        <View style={styles.suggestionCard}>
          <View style={styles.suggestionRow}>
            <Text style={styles.suggestionEmoji}>🚗</Text>
            <Text style={styles.suggestionText}>Oil changes</Text>
          </View>
  
          <View style={styles.suggestionRow}>
            <Text style={styles.suggestionEmoji}>🏋️</Text>
            <Text style={styles.suggestionText}>Gym sessions</Text>
          </View>
  
          <View style={styles.suggestionRow}>
            <Text style={styles.suggestionEmoji}>📖</Text>
            <Text style={styles.suggestionText}>Book reading</Text>
          </View>
  
          <View style={styles.suggestionRow}>
            <Text style={styles.suggestionEmoji}>✂️</Text>
            <Text style={styles.suggestionText}>Haircuts</Text>
          </View>
  
          <View style={[styles.suggestionRow, { marginBottom: 0 }]}>
            <Text style={styles.suggestionEmoji}>🚿</Text>
            <Text style={styles.suggestionText}>Car wash</Text>
          </View>
        </View>
      </View>
    );
  }
  