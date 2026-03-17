import React from 'react';
import { Alert, Container, Button } from 'react-bootstrap';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary capturou:', error, errorInfo);
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <Container className="mt-5">
          <Alert variant="danger">
            <Alert.Heading>Algo deu errado!</Alert.Heading>
            <p>Ocorreu um erro inesperado na aplicação.</p>
            <p><small>{this.state.error?.message}</small></p>
            <hr />
            <Button variant="outline-danger" onClick={this.handleReload}>
              Tentar novamente
            </Button>
          </Alert>
        </Container>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
