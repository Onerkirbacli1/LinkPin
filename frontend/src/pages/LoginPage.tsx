import { useState } from "react";
import {
  Box,
  Button,
  Input,
  FormControl,
  FormLabel,
  Heading,
  VStack,
  HStack,
  useToast,
  Card,
  CardBody,
  Text,
  Icon,
  useColorModeValue,
  InputGroup,
  InputLeftElement,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { LockIcon, EmailIcon } from "@chakra-ui/icons";
import apiClient from "../api/axiosConfig";

const LoginPage = () => {
  const toast = useToast();
  const navigate = useNavigate();
  
  // Hooks must be called at the top level
  const bgGradient = useColorModeValue(
    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    "linear-gradient(135deg, #1a202c 0%, #2d3748 100%)"
  );
  const glassBg = useColorModeValue(
    "rgba(255, 255, 255, 0.95)",
    "rgba(26, 32, 44, 0.9)"
  );
  const borderColor = useColorModeValue("rgba(255, 255, 255, 0.3)", "rgba(255, 255, 255, 0.1)");
  
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!username || !password) {
      toast({
        title: "Eksik Bilgi",
        description: "Lütfen kullanıcı adı ve şifrenizi girin.",
        status: "warning",
        duration: 2000,
        isClosable: true,
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiClient.post("/login", {
        username,
        password,
      });

      if (response.data.success) {
        if (response.data.token) {
          localStorage.setItem("token", response.data.token);
        }
        if (response.data.user) {
          localStorage.setItem("user", JSON.stringify(response.data.user));
        }
        toast({
          title: "Giriş Başarılı",
          status: "success",
          duration: 2000,
          isClosable: true,
        });
        navigate("/dashboard");
      } else {
        toast({
            title: "Hatalı Giriş",
            description: response.data.message || "Kullanıcı adı veya şifre yanlış.",
            status: "error",
            duration: 2000,
            isClosable: true,
         });
      }
    } catch (error) {
      toast({
        title: "Bağlantı Hatası",
        description: "Sunucuya bağlanılamadı. Lütfen tekrar deneyin.",
        status: "error",
        duration: 2000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box
      bgGradient={bgGradient}
      minH="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      p={4}
      position="relative"
      overflow="hidden"
    >
      {/* Animated background elements */}
      <Box
        position="absolute"
        top="-50%"
        right="-50%"
        w="600px"
        h="600px"
        bg="rgba(255, 255, 255, 0.1)"
        borderRadius="full"
        filter="blur(80px)"
        animation="pulse 8s ease-in-out infinite"
      />
      <Box
        position="absolute"
        bottom="-50%"
        left="-50%"
        w="600px"
        h="600px"
        bg="rgba(255, 255, 255, 0.1)"
        borderRadius="full"
        filter="blur(80px)"
        sx={{
          animation: "pulse 8s ease-in-out infinite",
          animationDelay: "2s",
        }}
      />

      <Card
        width="sm"
        boxShadow="2xl"
        borderRadius="2xl"
        bg={glassBg}
        backdropFilter="blur(10px)"
        className="fade-in"
        zIndex={1}
        border="1px solid"
        borderColor={borderColor}
      >
        <CardBody p={8}>
          <VStack spacing={6}>
            <VStack spacing={2}>
              <Box
                p={4}
                borderRadius="full"
                bgGradient="linear(to-r, purple.400, pink.400)"
                boxShadow="lg"
              >
                <Icon as={LockIcon} w={8} h={8} color="white" />
              </Box>
              <Heading
                size="xl"
                bgGradient="linear(to-r, purple.600, pink.600)"
                bgClip="text"
                fontWeight="bold"
              >
                LinkPin
              </Heading>
              <Text color="gray.600" fontSize="sm" textAlign="center">
                Hesabınıza giriş yapın
              </Text>
            </VStack>

            <VStack spacing={4} width="100%">
              <FormControl>
                <FormLabel fontWeight="semibold">Kullanıcı Adı</FormLabel>
                <InputGroup>
                  <InputLeftElement pointerEvents="none">
                    <EmailIcon color="gray.400" />
                  </InputLeftElement>
                  <Input
                    placeholder="Kullanıcı adınızı girin"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    size="lg"
                    borderRadius="lg"
                    _focus={{
                      borderColor: "purple.500",
                      boxShadow: "0 0 0 1px var(--chakra-colors-purple-500)",
                    }}
                  />
                </InputGroup>
              </FormControl>

              <FormControl>
                <FormLabel fontWeight="semibold">Şifre</FormLabel>
                <InputGroup>
                  <InputLeftElement pointerEvents="none">
                    <LockIcon color="gray.400" />
                  </InputLeftElement>
                  <Input
                    type="password"
                    placeholder="Şifrenizi girin"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    size="lg"
                    borderRadius="lg"
                    _focus={{
                      borderColor: "purple.500",
                      boxShadow: "0 0 0 1px var(--chakra-colors-purple-500)",
                    }}
                  />
                </InputGroup>
              </FormControl>

              <Button
                colorScheme="purple"
                width="100%"
                size="lg"
                onClick={handleLogin}
                isLoading={isLoading}
                loadingText="Giriş yapılıyor..."
                bgGradient="linear(to-r, purple.500, pink.500)"
                _hover={{
                  bgGradient: "linear(to-r, purple.600, pink.600)",
                  transform: "translateY(-2px)",
                  boxShadow: "xl",
                }}
                transition="all 0.2s"
              >
                Giriş Yap
              </Button>
            </VStack>

            <HStack spacing={1} fontSize="sm">
              <Text color="gray.600">Hesabın yok mu?</Text>
              <Button
                variant="link"
                colorScheme="purple"
                onClick={() => navigate("/register")}
                fontWeight="bold"
                _hover={{ textDecoration: "underline" }}
              >
                Kayıt Ol
              </Button>
            </HStack>
          </VStack>
        </CardBody>
      </Card>
    </Box>
  );
};

export default LoginPage;

