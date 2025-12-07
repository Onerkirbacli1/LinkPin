import { useState } from "react";
import {
  Box,
  Button,
  Input,
  FormControl,
  FormLabel,
  Heading,
  VStack,
  useToast,
  Card,
  CardBody,
  Text,
  Progress,
  HStack,
  Icon,
  useColorModeValue,
  InputGroup,
  InputLeftElement,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { LockIcon, EmailIcon, AtSignIcon } from "@chakra-ui/icons";
import apiClient from "../api/axiosConfig";
import { validatePassword, getPasswordStrengthColor } from "../utils/passwordValidator";

const RegisterPage = () => {
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
  
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passwordValidation, setPasswordValidation] = useState<{
    isValid: boolean;
    errors: string[];
    strength: "weak" | "medium" | "strong";
  } | null>(null);

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    if (value) {
      const validation = validatePassword(value);
      setPasswordValidation(validation);
    } else {
      setPasswordValidation(null);
    }
  };

  const handleRegister = async () => {
    if (!email || !firstName || !lastName || !password) {
      toast({
        title: "Eksik Bilgi",
        description: "Lütfen tüm alanları doldurun.",
        status: "warning",
        duration: 2000,
        isClosable: true,
      });
      return;
    }

    // Şifre validasyonu
    const validation = validatePassword(password);
    if (!validation.isValid) {
      toast({
        title: "Geçersiz Şifre",
        description: validation.errors[0],
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await apiClient.post("/register", {
        email,
        first_name: firstName,
        last_name: lastName,
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
          title: "Kayıt Başarılı",
          description: "Hesabınız oluşturuldu. Dashboard'a yönlendiriliyorsunuz.",
          status: "success",
          duration: 2000,
          isClosable: true,
        });

        navigate("/dashboard");
      }
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        "Kayıt oluşturulurken hata oluştu.";
      toast({
        title: "Hata",
        description: message,
        status: "error",
        duration: 2000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackToLogin = () => {
    navigate("/login");
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
        width="md"
        maxW="90vw"
        boxShadow="2xl"
        borderRadius="2xl"
        bg={glassBg}
        backdropFilter="blur(10px)"
        className="fade-in"
        zIndex={1}
        border="1px solid"
        borderColor={borderColor}
        maxH="90vh"
        overflowY="auto"
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
                <Icon as={AtSignIcon} w={8} h={8} color="white" />
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
                Yeni hesap oluşturun
              </Text>
            </VStack>

            <VStack spacing={4} width="100%">
              <FormControl>
                <FormLabel fontWeight="semibold">E-posta</FormLabel>
                <InputGroup>
                  <InputLeftElement pointerEvents="none">
                    <EmailIcon color="gray.400" />
                  </InputLeftElement>
                  <Input
                    type="email"
                    placeholder="ornek@mail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    size="lg"
                    borderRadius="lg"
                    _focus={{
                      borderColor: "purple.500",
                      boxShadow: "0 0 0 1px var(--chakra-colors-purple-500)",
                    }}
                  />
                </InputGroup>
              </FormControl>

              <HStack spacing={4} width="100%">
                <FormControl>
                  <FormLabel fontWeight="semibold">Ad</FormLabel>
                  <Input
                    placeholder="Adınız"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    size="lg"
                    borderRadius="lg"
                    _focus={{
                      borderColor: "purple.500",
                      boxShadow: "0 0 0 1px var(--chakra-colors-purple-500)",
                    }}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel fontWeight="semibold">Soyad</FormLabel>
                  <Input
                    placeholder="Soyadınız"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    size="lg"
                    borderRadius="lg"
                    _focus={{
                      borderColor: "purple.500",
                      boxShadow: "0 0 0 1px var(--chakra-colors-purple-500)",
                    }}
                  />
                </FormControl>
              </HStack>

              <FormControl>
                <FormLabel fontWeight="semibold">Parola</FormLabel>
                <InputGroup>
                  <InputLeftElement pointerEvents="none">
                    <LockIcon color="gray.400" />
                  </InputLeftElement>
                  <Input
                    type="password"
                    placeholder="Şifrenizi girin (min. 8 karakter)"
                    value={password}
                    onChange={(e) => handlePasswordChange(e.target.value)}
                    size="lg"
                    borderRadius="lg"
                    _focus={{
                      borderColor: "purple.500",
                      boxShadow: "0 0 0 1px var(--chakra-colors-purple-500)",
                    }}
                  />
                </InputGroup>
                {passwordValidation && (
                  <VStack align="stretch" mt={3} spacing={2}>
                    <HStack>
                      <Text fontSize="xs" color="gray.600" fontWeight="medium">
                        Şifre Gücü:
                      </Text>
                      <Progress
                        value={
                          passwordValidation.strength === "strong"
                            ? 100
                            : passwordValidation.strength === "medium"
                            ? 66
                            : 33
                        }
                        colorScheme={getPasswordStrengthColor(passwordValidation.strength)}
                        size="sm"
                        flex={1}
                        borderRadius="full"
                      />
                      <Text
                        fontSize="xs"
                        fontWeight="bold"
                        color={`${getPasswordStrengthColor(passwordValidation.strength)}.500`}
                        minW="50px"
                        textAlign="right"
                      >
                        {passwordValidation.strength === "strong"
                          ? "Güçlü"
                          : passwordValidation.strength === "medium"
                          ? "Orta"
                          : "Zayıf"}
                      </Text>
                    </HStack>
                    {passwordValidation.errors.length > 0 && (
                      <Box
                        p={2}
                        borderRadius="md"
                        bg="red.50"
                        border="1px solid"
                        borderColor="red.200"
                      >
                        <VStack align="start" spacing={1}>
                          {passwordValidation.errors.map((error, index) => (
                            <Text key={index} fontSize="xs" color="red.600">
                              • {error}
                            </Text>
                          ))}
                        </VStack>
                      </Box>
                    )}
                  </VStack>
                )}
              </FormControl>

              <Button
                colorScheme="purple"
                width="100%"
                size="lg"
                onClick={handleRegister}
                isLoading={isSubmitting}
                loadingText="Kaydediliyor..."
                bgGradient="linear(to-r, purple.500, pink.500)"
                _hover={{
                  bgGradient: "linear(to-r, purple.600, pink.600)",
                  transform: "translateY(-2px)",
                  boxShadow: "xl",
                }}
                transition="all 0.2s"
              >
                Kayıt Ol
              </Button>

              <Button
                variant="ghost"
                colorScheme="purple"
                onClick={handleBackToLogin}
                width="100%"
                _hover={{ bg: "purple.50" }}
              >
                Giriş Sayfasına Dön
              </Button>
            </VStack>
          </VStack>
        </CardBody>
      </Card>
    </Box>
  );
};

export default RegisterPage;

