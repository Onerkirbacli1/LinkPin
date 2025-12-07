import React, { useState, useEffect, useCallback } from "react";
import { 
  Box, 
  Heading, 
  Text, 
  Button, 
  VStack, 
  Card, 
  CardBody, 
  HStack,
  Badge,
  useToast,
  Spinner,
  Center,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Link,
  Icon,
  IconButton,
  useColorMode,
  useColorModeValue,
  Progress,
  Divider,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { ExternalLinkIcon, MoonIcon, SunIcon, LinkIcon, SettingsIcon, ArrowForwardIcon } from "@chakra-ui/icons";
import apiClient from "../api/axiosConfig";
import { LinkItem, CATEGORY_COLORS } from "../types";

const Dashboard = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { colorMode, toggleColorMode } = useColorMode();
  
  // Hooks must be called at the top level
  const bgColor = useColorModeValue("gray.50", "gray.900");
  const cardBg = useColorModeValue("white", "gray.800");
  const headingColor = useColorModeValue("purple.600", "purple.400");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const hoverBg = useColorModeValue("gray.100", "gray.700");
  const textColor = useColorModeValue("gray.800", "gray.100");
  const emptyTextColor = useColorModeValue("gray.500", "gray.400");
  
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState<{
    total_links: number;
    recent_links: LinkItem[];
  } | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
    fetchUserInfo();
    fetchStats();
  }, [navigate]);

  const fetchUserInfo = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get("/dashboard/user");
      if (response.data.success) {
        setUser(response.data.user);
        localStorage.setItem("user", JSON.stringify(response.data.user));
      }
    } catch (error) {
      toast({
        title: "Hata",
        description: "Kullanıcı bilgileri yüklenemedi.",
        status: "error",
        duration: 2000,
        isClosable: true,
      });
      navigate("/login");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await apiClient.post("/dashboard/logout");
    } catch (error) {
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      navigate("/login");
    }
  };

  const handleViewLinks = () => {
    navigate("/links");
  };

  const handleViewProfile = () => {
    navigate("/profile");
  };

  const fetchStats = async () => {
    setIsLoadingStats(true);
    try {
      const response = await apiClient.get("/dashboard/stats");
      if (response.data.success) {
        setStats(response.data.stats);
      }
    } catch (error) {
      // Stats yüklenemezse sessizce devam et
    } finally {
      setIsLoadingStats(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Bilinmiyor";
    const date = new Date(dateString);
    return date.toLocaleDateString("tr-TR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
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
      <Box maxW="1200px" mx="auto">
        <Card
          mb={6}
          boxShadow="xl"
          borderRadius="2xl"
          bg={cardBg}
          className="fade-in hover-lift"
          border="1px solid"
          borderColor={borderColor}
        >
          <CardBody p={6}>
            <HStack justify="space-between" align="center" flexWrap="wrap" gap={4}>
              <VStack align="start" spacing={3}>
                <HStack spacing={3}>
                  <Box
                    p={3}
                    borderRadius="xl"
                    bgGradient="linear(to-r, purple.500, pink.500)"
                    boxShadow="md"
                  >
                    <Icon as={LinkIcon} w={6} h={6} color="white" />
                  </Box>
                  <VStack align="start" spacing={0}>
                    <Heading size="lg" color={headingColor} fontWeight="bold">
                      LinkPin
                    </Heading>
                    <Text fontSize="md" color="gray.600" mt={1}>
                      Hoş Geldiniz, {user.namesurname}!
                    </Text>
                    <HStack mt={1}>
                      <Text fontSize="sm" color="gray.500">
                        Kullanıcı Adı:
                      </Text>
                      <Badge
                        colorScheme="purple"
                        fontSize="sm"
                        px={3}
                        py={1}
                        borderRadius="full"
                      >
                        {user.username}
                      </Badge>
                    </HStack>
                  </VStack>
                </HStack>
              </VStack>
              <HStack spacing={2} flexWrap="wrap">
                <IconButton
                  aria-label="Toggle color mode"
                  icon={colorMode === "light" ? <MoonIcon /> : <SunIcon />}
                  onClick={toggleColorMode}
                  variant="ghost"
                  size="md"
                  borderRadius="lg"
                  _hover={{ bg: hoverBg }}
                />
                <Button
                  colorScheme="purple"
                  onClick={handleViewProfile}
                  size="md"
                  fontWeight="semibold"
                  leftIcon={<SettingsIcon />}
                  borderRadius="lg"
                  _hover={{
                    transform: "translateY(-2px)",
                    boxShadow: "lg",
                  }}
                  transition="all 0.2s"
                >
                  Profil
                </Button>
                <Button
                  colorScheme="red"
                  onClick={handleLogout}
                  size="md"
                  borderRadius="lg"
                  _hover={{
                    transform: "translateY(-2px)",
                    boxShadow: "lg",
                  }}
                  transition="all 0.2s"
                >
                  Çıkış
                </Button>
              </HStack>
            </HStack>
          </CardBody>
        </Card>

        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} mb={6}>
          <Card
            boxShadow="xl"
            borderRadius="2xl"
            bg={cardBg}
            className="fade-in hover-lift"
            border="1px solid"
            borderColor={borderColor}
            overflow="hidden"
            position="relative"
          >
            <Box
              position="absolute"
              top={0}
              left={0}
              right={0}
              h="4px"
              bgGradient="linear(to-r, purple.500, pink.500)"
            />
            <CardBody p={6}>
              <Stat>
                <HStack justify="space-between" align="start" mb={4}>
                  <Box
                    p={3}
                    borderRadius="xl"
                    bgGradient="linear(to-r, purple.100, pink.100)"
                    _dark={{ bgGradient: "linear(to-r, purple.900, pink.900)" }}
                  >
                    <Icon as={LinkIcon} w={6} h={6} color="purple.600" />
                  </Box>
                </HStack>
                <StatLabel fontSize="md" fontWeight="semibold" color="gray.600">
                  Toplam Link Sayısı
                </StatLabel>
                <StatNumber
                  fontSize="4xl"
                  fontWeight="bold"
                  bgGradient="linear(to-r, purple.600, pink.600)"
                  bgClip="text"
                  mt={2}
                >
                  {isLoadingStats ? (
                    <Spinner size="md" color="purple.500" />
                  ) : (
                    stats?.total_links ?? 0
                  )}
                </StatNumber>
                <StatHelpText mt={2} fontSize="sm">
                  Tüm kayıtlı linkleriniz
                </StatHelpText>
                {stats && stats.total_links > 0 && (
                  <Box mt={4}>
                    <Progress
                      value={Math.min((stats.total_links / 100) * 100, 100)}
                      colorScheme="purple"
                      size="sm"
                      borderRadius="full"
                    />
                  </Box>
                )}
              </Stat>
            </CardBody>
          </Card>

          <Card
            boxShadow="xl"
            borderRadius="2xl"
            bg={cardBg}
            className="fade-in hover-lift"
            border="1px solid"
            borderColor={borderColor}
            overflow="hidden"
            position="relative"
          >
            <Box
              position="absolute"
              top={0}
              left={0}
              right={0}
              h="4px"
              bgGradient="linear(to-r, blue.500, cyan.500)"
            />
            <CardBody p={6}>
              <VStack spacing={4} align="stretch">
                <HStack>
                  <Box
                    p={3}
                    borderRadius="xl"
                    bgGradient="linear(to-r, blue.100, cyan.100)"
                    _dark={{ bgGradient: "linear(to-r, blue.900, cyan.900)" }}
                  >
                    <Icon as={ArrowForwardIcon} w={6} h={6} color="blue.600" />
                  </Box>
                  <Heading size="md" color={headingColor} fontWeight="bold">
                    Hızlı İşlemler
                  </Heading>
                </HStack>
                <Divider />
                <Button
                  colorScheme="purple"
                  size="lg"
                  width="100%"
                  onClick={handleViewLinks}
                  rightIcon={<ArrowForwardIcon />}
                  bgGradient="linear(to-r, purple.500, pink.500)"
                  _hover={{
                    bgGradient: "linear(to-r, purple.600, pink.600)",
                    transform: "translateY(-2px)",
                    boxShadow: "xl",
                  }}
                  transition="all 0.2s"
                  borderRadius="lg"
                >
                  Linklerimi Yönet
                </Button>
              </VStack>
            </CardBody>
          </Card>
        </SimpleGrid>

        {stats && stats.recent_links && stats.recent_links.length > 0 && (
          <Card
            boxShadow="xl"
            borderRadius="2xl"
            bg={cardBg}
            className="fade-in"
            border="1px solid"
            borderColor={borderColor}
          >
            <CardBody p={6}>
              <HStack mb={4}>
                <Icon as={LinkIcon} w={5} h={5} color="purple.500" />
                <Heading size="md" color={headingColor} fontWeight="bold">
                  Son Eklenen Linkler
                </Heading>
              </HStack>
              <Divider mb={4} />
              <VStack spacing={3} align="stretch">
                {stats.recent_links.map((link, index) => (
                  <Card
                    key={link.id}
                    variant="outline"
                    size="sm"
                    className="hover-lift"
                    borderColor={borderColor}
                    _hover={{
                      borderColor: "purple.300",
                      boxShadow: "md",
                    }}
                    transition="all 0.2s"
                  >
                    <CardBody p={4}>
                      <HStack justify="space-between" align="center">
                        <VStack align="start" spacing={2} flex={1} minW={0}>
                          <HStack spacing={2} width="100%">
                            {link.title && (
                              <Text
                                fontWeight="semibold"
                                fontSize="md"
                                color={textColor}
                                noOfLines={1}
                                flex={1}
                              >
                                {link.title}
                              </Text>
                            )}
                            <Badge
                              colorScheme={CATEGORY_COLORS[link.category || "Diğer"] || "gray"}
                              fontSize="xs"
                              borderRadius="full"
                              px={2}
                              py={1}
                            >
                              {link.category || "Diğer"}
                            </Badge>
                          </HStack>
                          <Link
                            href={link.url}
                            isExternal
                            color="purple.600"
                            fontWeight="normal"
                            fontSize="sm"
                            noOfLines={1}
                            _hover={{ textDecoration: "underline" }}
                          >
                            {link.url}
                            <Icon as={ExternalLinkIcon} mx={1} />
                          </Link>
                          <Text fontSize="xs" color="gray.500">
                            {formatDate(link.created_at)}
                          </Text>
                        </VStack>
                        <Button
                          size="sm"
                          colorScheme="purple"
                          variant="ghost"
                          onClick={() => navigate("/links")}
                          borderRadius="lg"
                          _hover={{ bg: "purple.50", transform: "scale(1.05)" }}
                          transition="all 0.2s"
                        >
                          Düzenle
                        </Button>
                      </HStack>
                    </CardBody>
                  </Card>
                ))}
              </VStack>
              {stats.total_links > 5 && (
                <Button
                  mt={4}
                  width="100%"
                  variant="outline"
                  colorScheme="purple"
                  onClick={handleViewLinks}
                  rightIcon={<ArrowForwardIcon />}
                  borderRadius="lg"
                  _hover={{
                    bg: "purple.50",
                    borderColor: "purple.300",
                    transform: "translateY(-2px)",
                  }}
                  transition="all 0.2s"
                >
                  Tüm Linkleri Görüntüle ({stats.total_links})
                </Button>
              )}
            </CardBody>
          </Card>
        )}

        {stats && stats.total_links === 0 && (
          <Card
            boxShadow="xl"
            borderRadius="2xl"
            bg={cardBg}
            className="fade-in"
            border="1px solid"
            borderColor={borderColor}
          >
            <CardBody>
              <VStack spacing={6} py={12}>
                <Box
                  p={6}
                  borderRadius="full"
                  bgGradient="linear(to-r, purple.100, pink.100)"
                  _dark={{ bgGradient: "linear(to-r, purple.900, pink.900)" }}
                >
                  <Icon as={LinkIcon} w={12} h={12} color="purple.600" />
                </Box>
                <VStack spacing={2}>
                  <Heading size="md" color={headingColor}>
                    Henüz hiç link eklemediniz
                  </Heading>
                  <Text color="gray.500" fontSize="md" textAlign="center">
                    İlk linkinizi ekleyerek başlayın
                  </Text>
                </VStack>
                <Button
                  colorScheme="purple"
                  size="lg"
                  onClick={handleViewLinks}
                  rightIcon={<ArrowForwardIcon />}
                  bgGradient="linear(to-r, purple.500, pink.500)"
                  _hover={{
                    bgGradient: "linear(to-r, purple.600, pink.600)",
                    transform: "translateY(-2px)",
                    boxShadow: "xl",
                  }}
                  transition="all 0.2s"
                  borderRadius="lg"
                >
                  İlk Linkinizi Ekleyin
                </Button>
              </VStack>
            </CardBody>
          </Card>
        )}
      </Box>
    </Box>
  );
};

export default Dashboard;

