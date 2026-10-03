import { StyleSheet, Text, View } from 'react-native';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Life Assistant</Text>
      <Text style={styles.subtitle}>Pantalla única y limpia :v</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#38bdf8',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#94a3b8',
  },
});