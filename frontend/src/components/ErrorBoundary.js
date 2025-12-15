import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error,
      errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <View style={styles.card}>
            <Text style={styles.title}>⚠️ Ошибка приложения</Text>
            <Text style={styles.message}>
              {this.state.error && this.state.error.toString()}
            </Text>
            {this.state.errorInfo && (
              <Text style={styles.stack}>
                {this.state.errorInfo.componentStack}
              </Text>
            )}
            <TouchableOpacity 
              style={styles.button}
              onPress={() => {
                this.setState({ hasError: false, error: null, errorInfo: null });
                if (typeof window !== 'undefined') {
                  window.location.reload();
                }
              }}
            >
              <Text style={styles.buttonText}>Перезагрузить</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F23',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#1F2047',
    borderRadius: 20,
    padding: 30,
    maxWidth: 600,
    width: '100%',
    borderWidth: 2,
    borderColor: '#EF4444',
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: '#F8FAFC',
    marginBottom: 16,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#EF4444',
    marginBottom: 12,
    fontWeight: '600',
  },
  stack: {
    fontSize: 12,
    color: '#94A3B8',
    fontFamily: 'monospace',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#6366F1',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default ErrorBoundary;

