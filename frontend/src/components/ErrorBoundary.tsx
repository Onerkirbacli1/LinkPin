import React, { Component, ErrorInfo, ReactNode } from "react";
import {
  Box,
  VStack,
  Heading,
  Text,
  Button,
  Card,
  CardBody,
  Icon,
} from "@chakra-ui/react";
import { WarningIcon } from "@chakra-ui/icons";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });

    // Burada bir hata loglama servisine gönderebilirsiniz
    // Örneğin: Sentry, LogRocket, vb.
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <Box
          minH="100vh"
          bg="gray.50"
          display="flex"
          alignItems="center"
          justifyContent="center"
          p={4}
        >
          <Card maxW="600px" boxShadow="lg" borderRadius="xl">
            <CardBody>
              <VStack spacing={6} align="stretch">
                <VStack spacing={4}>
                  <Icon as={WarningIcon} w={16} h={16} color="red.500" />
                  <Heading size="lg" color="red.600">
                    Bir Hata Oluştu
                  </Heading>
                  <Text color="gray.600" textAlign="center">
                    Üzgünüz, beklenmeyen bir hata oluştu. Lütfen sayfayı yenileyin
                    veya tekrar deneyin.
                  </Text>
                </VStack>

                {process.env.NODE_ENV === "development" && this.state.error && (
                  <Box
                    bg="gray.100"
                    p={4}
                    borderRadius="md"
                    maxH="300px"
                    overflowY="auto"
                  >
                    <Text fontSize="sm" fontWeight="bold" mb={2} color="red.600">
                      Hata Detayları (Sadece Geliştirme Modu):
                    </Text>
                    <Text fontSize="xs" fontFamily="mono" color="gray.700">
                      {this.state.error.toString()}
                    </Text>
                    {this.state.errorInfo && (
                      <Text
                        fontSize="xs"
                        fontFamily="mono"
                        color="gray.600"
                        mt={2}
                        whiteSpace="pre-wrap"
                      >
                        {this.state.errorInfo.componentStack}
                      </Text>
                    )}
                  </Box>
                )}

                <VStack spacing={3} w="100%">
                  <Button
                    colorScheme="teal"
                    size="lg"
                    w="100%"
                    onClick={this.handleReload}
                  >
                    Sayfayı Yenile
                  </Button>
                  <Button
                    variant="outline"
                    colorScheme="teal"
                    size="lg"
                    w="100%"
                    onClick={this.handleReset}
                  >
                    Tekrar Dene
                  </Button>
                  <Button
                    variant="ghost"
                    colorScheme="teal"
                    size="md"
                    onClick={() => (window.location.href = "/dashboard")}
                  >
                    Ana Sayfaya Dön
                  </Button>
                </VStack>
              </VStack>
            </CardBody>
          </Card>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

