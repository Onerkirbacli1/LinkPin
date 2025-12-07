import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Heading,
  Button,
  Input,
  FormControl,
  FormLabel,
  VStack,
  Card,
  CardBody,
  HStack,
  useToast,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Divider,
  Text,
  Spinner,
  Center,
  Progress,
  useColorModeValue,
  Icon,
  InputGroup,
  InputLeftElement,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { SettingsIcon, ArrowBackIcon, LockIcon, EmailIcon, AtSignIcon } from "@chakra-ui/icons";
import apiClient from "../api/axiosConfig";
import { User } from "../types";
import { validatePassword, getPasswordStrengthColor } from "../utils/passwordValidator";

const ProfilePage = () => {
  const navigate = useNavigate();
  const toast = useToast();
  
  // Hooks must be called at the top level
  const bgColor = useColorModeValue("gray.50", "gray.900");
  const cardBg = useColorModeValue("white", "gray.800");
  const headingColor = useColorModeValue("purple.600", "purple.400");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const inputBg = useColorModeValue("gray.50", "gray.700");
  
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordValidation, setPasswordValidation] = useState<{
    isValid: boolean;
    errors: string[];
    strength: "weak" | "medium" | "strong";
  } | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
    fetchProfile();
  }, [navigate]);

  const fetchProfile = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get("/profile");
      if (response.data.success) {
        const userData = response.data.user;
        setUser(userData);
        setFirstName(userData.first_name || "");
        setLastName(userData.last_name || "");
      }
    } catch (error) {
      toast({
        title: "Hata",
        description: "Profil bilgileri yüklenemedi.",
        status: "error",
        duration: 2000,
        isClosable: true,
      });
      navigate("/dashboard");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      toast({
        title: "Hata",
        description: "Ad ve soyad alanları zorunludur.",
        status: "error",
        duration: 2000,
        isClosable: true,
      });
      return;
    }

    setIsSaving(true);
    try {
      const response = await apiClient.put("/profile", {
        first_name: firstName.trim(),
        last_name: lastName.trim(),
      });

      if (response.data.success) {
        const updatedUser = response.data.user;
        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify({
          username: updatedUser.username,
          namesurname: updatedUser.namesurname
        }));

        toast({
          title: "Başarılı",
          description: "Profil başarıyla güncellendi!",
          status: "success",
          duration: 2000,
          isClosable: true,
        });
      }
    } catch (error: any) {
      toast({
        title: "Hata",
        description: error?.response?.data?.message || "Profil güncellenirken bir hata oluştu.",
        status: "error",
        duration: 2000,
        isClosable: true,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast({
        title: "Hata",
        description: "Tüm şifre alanları zorunludur.",
        status: "error",
        duration: 2000,
        isClosable: true,
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Hata",
        description: "Yeni şifre ve şifre tekrarı eşleşmiyor.",
        status: "error",
        duration: 2000,
        isClosable: true,
      });
      return;
    }

    // Şifre validasyonu
    const validation = validatePassword(newPassword);
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

    setIsChangingPassword(true);
    try {
      const response = await apiClient.put("/profile/password", {
        current_password: currentPassword,
        new_password: newPassword,
        confirm_password: confirmPassword,
      });

      if (response.data.success) {
        toast({
          title: "Başarılı",
          description: "Şifre başarıyla değiştirildi!",
          status: "success",
          duration: 2000,
          isClosable: true,
        });

        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setPasswordValidation(null);
      }
    } catch (error: any) {
      toast({
        title: "Hata",
        description: error?.response?.data?.message || "Şifre değiştirilirken bir hata oluştu.",
        status: "error",
        duration: 2000,
        isClosable: true,
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleBackToDashboard = () => {
    navigate("/dashboard");
  };

  if (isLoading || !user) {
    return (
      <Box bg={bgColor} minH="100vh" p={8}>
        <Center h="100vh">
          <VStack spacing={4}>
            <Spinner size="xl" color="purple.500" thickness="4px" />
            <Text color="gray.500">Yükleniyor...</Text>
          </VStack>
        </Center>
      </Box>
    );
  }

  return (
    <Box bg={bgColor} minH="100vh" p={8}>
      <Box maxW="800px" mx="auto">
        <Card
          mb={6}
          boxShadow="xl"
          borderRadius="2xl"
          bg={cardBg}
          className="fade-in"
          border="1px solid"
          borderColor={borderColor}
        >
          <CardBody p={6}>
            <HStack justify="space-between" align="center" mb={4} flexWrap="wrap" gap={4}>
              <HStack spacing={3}>
                <Box
                  p={3}
                  borderRadius="xl"
                  bgGradient="linear(to-r, purple.500, pink.500)"
                  boxShadow="md"
                >
                  <Icon as={SettingsIcon} w={6} h={6} color="white" />
                </Box>
                <VStack align="start" spacing={0}>
                  <Heading size="xl" color={headingColor} fontWeight="bold">
                    LinkPin
                  </Heading>
                  <Text fontSize="sm" color="gray.500">
                    Profil Ayarları
                  </Text>
                </VStack>
              </HStack>
              <Button
                variant="outline"
                colorScheme="purple"
                onClick={handleBackToDashboard}
                leftIcon={<ArrowBackIcon />}
                borderRadius="lg"
                _hover={{
                  bg: "purple.50",
                  transform: "translateY(-2px)",
                }}
                transition="all 0.2s"
              >
                Dashboard'a Dön
              </Button>
            </HStack>
          </CardBody>
        </Card>

        <Card
          boxShadow="xl"
          borderRadius="2xl"
          bg={cardBg}
          className="fade-in"
          border="1px solid"
          borderColor={borderColor}
        >
          <CardBody p={6}>
            <Tabs colorScheme="purple" variant="enclosed">
              <TabList>
                <Tab fontWeight="semibold" _selected={{ color: "purple.600", borderColor: "purple.500" }}>
                  Profil Bilgileri
                </Tab>
                <Tab fontWeight="semibold" _selected={{ color: "purple.600", borderColor: "purple.500" }}>
                  Şifre Değiştir
                </Tab>
              </TabList>

              <TabPanels>
                <TabPanel pt={6}>
                  <VStack spacing={5} align="stretch">
                    <FormControl>
                      <FormLabel fontWeight="semibold">Kullanıcı Adı</FormLabel>
                      <InputGroup>
                        <InputLeftElement pointerEvents="none">
                          <EmailIcon color="gray.400" />
                        </InputLeftElement>
                        <Input
                          value={user.username}
                          isReadOnly
                          bg={inputBg}
                          cursor="not-allowed"
                          size="lg"
                          borderRadius="lg"
                        />
                      </InputGroup>
                      <Text fontSize="sm" color="gray.500" mt={1}>
                        Kullanıcı adı değiştirilemez.
                      </Text>
                    </FormControl>

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

                    <Button
                      colorScheme="purple"
                      onClick={handleUpdateProfile}
                      isLoading={isSaving}
                      loadingText="Kaydediliyor..."
                      size="lg"
                      bgGradient="linear(to-r, purple.500, pink.500)"
                      _hover={{
                        bgGradient: "linear(to-r, purple.600, pink.600)",
                        transform: "translateY(-2px)",
                        boxShadow: "xl",
                      }}
                      transition="all 0.2s"
                      borderRadius="lg"
                    >
                      Profili Güncelle
                    </Button>
                  </VStack>
                </TabPanel>

                <TabPanel pt={6}>
                  <VStack spacing={5} align="stretch">
                    <FormControl>
                      <FormLabel fontWeight="semibold">Mevcut Şifre</FormLabel>
                      <InputGroup>
                        <InputLeftElement pointerEvents="none">
                          <LockIcon color="gray.400" />
                        </InputLeftElement>
                        <Input
                          type="password"
                          placeholder="Mevcut şifrenizi girin"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          size="lg"
                          borderRadius="lg"
                          _focus={{
                            borderColor: "purple.500",
                            boxShadow: "0 0 0 1px var(--chakra-colors-purple-500)",
                          }}
                        />
                      </InputGroup>
                    </FormControl>

                    <Divider />

                    <FormControl>
                      <FormLabel fontWeight="semibold">Yeni Şifre</FormLabel>
                      <InputGroup>
                        <InputLeftElement pointerEvents="none">
                          <LockIcon color="gray.400" />
                        </InputLeftElement>
                        <Input
                          type="password"
                          placeholder="Yeni şifrenizi girin (min. 8 karakter)"
                          value={newPassword}
                          onChange={(e) => {
                            const value = e.target.value;
                            setNewPassword(value);
                            if (value) {
                              const validation = validatePassword(value);
                              setPasswordValidation(validation);
                            } else {
                              setPasswordValidation(null);
                            }
                          }}
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

                    <FormControl>
                      <FormLabel fontWeight="semibold">Yeni Şifre Tekrar</FormLabel>
                      <InputGroup>
                        <InputLeftElement pointerEvents="none">
                          <LockIcon color="gray.400" />
                        </InputLeftElement>
                        <Input
                          type="password"
                          placeholder="Yeni şifrenizi tekrar girin"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
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
                      onClick={handleChangePassword}
                      isLoading={isChangingPassword}
                      loadingText="Değiştiriliyor..."
                      size="lg"
                      bgGradient="linear(to-r, purple.500, pink.500)"
                      _hover={{
                        bgGradient: "linear(to-r, purple.600, pink.600)",
                        transform: "translateY(-2px)",
                        boxShadow: "xl",
                      }}
                      transition="all 0.2s"
                      borderRadius="lg"
                    >
                      Şifreyi Değiştir
                    </Button>
                  </VStack>
                </TabPanel>
              </TabPanels>
            </Tabs>
          </CardBody>
        </Card>
      </Box>
    </Box>
  );
};

export default ProfilePage;

