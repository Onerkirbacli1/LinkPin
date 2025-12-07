import React, { useEffect, useState, useMemo, useCallback } from "react";
import {
  Box,
  Heading,
  Button,
  useToast,
  HStack,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  IconButton,
  Card,
  CardBody,
  Text,
  Spinner,
  Center,
  VStack,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Input,
  FormControl,
  FormLabel,
  useDisclosure,
  InputGroup,
  InputLeftElement,
  Select,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Checkbox,
  CheckboxGroup,
  useColorMode,
  useColorModeValue,
  Switch,
  FormLabel as ChakraFormLabel,
  Image,
  Link as ChakraLink,
  Tooltip,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  PopoverHeader,
  SimpleGrid,
  Skeleton,
  SkeletonText,
  Divider,
  Icon,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { SearchIcon, CopyIcon, ChevronUpIcon, ChevronDownIcon, StarIcon, LinkIcon, ViewIcon, EditIcon, DeleteIcon, ExternalLinkIcon, MoonIcon, SunIcon, AddIcon, HamburgerIcon } from "@chakra-ui/icons";
import apiClient from "../api/axiosConfig";
import { LinkItem, LINK_CATEGORIES, CATEGORY_COLORS } from "../types";
import { validateUrl, normalizeUrl } from "../utils/urlValidator";

const LinksPage = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onClose: onDeleteClose,
  } = useDisclosure();
  const cancelRef = React.useRef<HTMLButtonElement>(null);
  const { colorMode } = useColorMode();
  
  // Hooks must be called at the top level
  const bgColor = useColorModeValue("gray.50", "gray.900");
  const cardBg = useColorModeValue("white", "gray.800");
  const headingColor = useColorModeValue("purple.600", "purple.400");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const tableHoverBg = useColorModeValue("gray.50", "gray.700");
  const inputBg = useColorModeValue("gray.50", "gray.700");
  const theadBg = useColorModeValue("gray.100", "gray.700");
  
  const [user, setUser] = useState<any>(null);
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [editingLink, setEditingLink] = useState<LinkItem | null>(null);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkTitle, setLinkTitle] = useState("");
  const [linkCategory, setLinkCategory] = useState<string>("Diğer");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("Tümü");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [linkToDelete, setLinkToDelete] = useState<LinkItem | null>(null);
  const [selectedLinks, setSelectedLinks] = useState<number[]>([]);
  const [favoriteFilter, setFavoriteFilter] = useState<"all" | "favorites">("all");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");

  const fetchUserLinks = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get("/links");
      if (response.data && response.data.links) {
        const fetchedLinks: LinkItem[] = response.data.links || [];
        setLinks(fetchedLinks);
      } else {
        // Eğer response formatı beklenen gibi değilse
        setLinks([]);
        toast({
          title: "Uyarı",
          description: "Linkler yüklenirken bir sorun oluştu.",
          status: "warning",
          duration: 2000,
          isClosable: true,
        });
      }
    } catch (error: any) {
      console.error("Linkler yüklenirken hata:", error);
      const errorMessage = error?.response?.data?.message || 
                          error?.response?.data?.error || 
                          "Linkler yüklenemedi. Lütfen daha sonra tekrar deneyin.";
      toast({
        title: "Hata",
        description: errorMessage,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      setLinks([]);
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");
    if (!token || !savedUser) {
      navigate("/login");
      return;
    }
    const parsedUser = JSON.parse(savedUser);
    setUser(parsedUser);
    fetchUserLinks();
  }, [navigate, fetchUserLinks]);

  const handleDeleteClick = (link: LinkItem) => {
    setLinkToDelete(link);
    onDeleteOpen();
  };

  const handleDeleteConfirm = async () => {
    if (!linkToDelete) return;
    
    setIsDeleting(linkToDelete.id);
    try {
      await apiClient.delete(`/links/${linkToDelete.id}`);
      
      toast({
        title: "Başarılı",
        description: "Link başarıyla silindi!",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
      
      fetchUserLinks();
      onDeleteClose();
      setLinkToDelete(null);
    } catch (error) {
      toast({
        title: "Hata",
        description: "Link silinirken bir problem oluştu.",
        status: "error",
        duration: 2000,
        isClosable: true,
      });
    } finally {
      setIsDeleting(null);
    }
  };

  const handleCopyLink = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      toast({
        title: "Kopyalandı!",
        description: "Link panoya kopyalandı.",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Hata",
        description: "Link kopyalanamadı.",
        status: "error",
        duration: 2000,
        isClosable: true,
      });
    }
  };

  const handleView = (url: string) => {
    window.open(url, "_blank");
  };

  const handleEdit = (link: LinkItem) => {
    setEditingLink(link);
    setLinkUrl(link.url);
    setLinkTitle(link.title || "");
    setLinkCategory(link.category || "Diğer");
    onOpen();
  };

  const handleCreate = () => {
    setEditingLink(null);
    setLinkUrl("");
    setLinkTitle("");
    setLinkCategory("Diğer");
    onOpen();
  };

  const handleModalClose = () => {
    setLinkUrl("");
    setLinkTitle("");
    setLinkCategory("Diğer");
    setEditingLink(null);
    onClose();
  };

  const handleSaveLink = async () => {
    if (!linkUrl.trim()) {
      toast({
        title: "Hata",
        description: "Lütfen geçerli bir URL girin.",
        status: "error",
        duration: 2000,
        isClosable: true,
      });
      return;
    }

    const validation = validateUrl(linkUrl);
    if (!validation.isValid) {
      toast({
        title: "Geçersiz URL",
        description: validation.error,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const normalizedUrl = normalizeUrl(linkUrl);

    setIsSaving(true);
    try {
      if (editingLink) {
        await apiClient.put(`/links/${editingLink.id}`, {
          url: normalizedUrl,
          title: linkTitle.trim(),
          category: linkCategory,
        });
        toast({
          title: "Başarılı",
          description: "Link başarıyla güncellendi!",
          status: "success",
          duration: 2000,
          isClosable: true,
        });
      } else {
        await apiClient.post("/links", {
          link: normalizedUrl,
          title: linkTitle.trim(),
          category: linkCategory,
        });
        toast({
          title: "Başarılı",
          description: "Link başarıyla eklendi!",
          status: "success",
          duration: 2000,
          isClosable: true,
        });
      }
      
      onClose();
      setLinkUrl("");
      setLinkTitle("");
      setLinkCategory("Diğer");
      setEditingLink(null);
      fetchUserLinks();
    } catch (error: any) {
      toast({
        title: "Hata",
        description: error?.response?.data?.error || "Link kaydedilirken bir problem oluştu.",
        status: "error",
        duration: 2000,
        isClosable: true,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleBackToDashboard = () => {
    navigate("/dashboard");
  };

  const handleToggleFavorite = async (linkId: number) => {
    try {
      const response = await apiClient.put(`/links/${linkId}/favorite`);
      if (response.data.success) {
        setLinks(links.map(link => 
          link.id === linkId 
            ? { ...link, is_favorite: response.data.is_favorite }
            : link
        ));
        toast({
          title: "Başarılı",
          description: response.data.is_favorite ? "Favorilere eklendi!" : "Favorilerden çıkarıldı!",
          status: "success",
          duration: 2000,
          isClosable: true,
        });
      }
    } catch (error: any) {
      toast({
        title: "Hata",
        description: error?.response?.data?.message || "Favori durumu güncellenemedi.",
        status: "error",
        duration: 2000,
        isClosable: true,
      });
    }
  };

  const handleSelectLink = (linkId: number) => {
    setSelectedLinks(prev => 
      prev.includes(linkId) 
        ? prev.filter(id => id !== linkId)
        : [...prev, linkId]
    );
  };

  const handleSelectAll = () => {
    if (selectedLinks.length === filteredAndSortedLinks.length) {
      setSelectedLinks([]);
    } else {
      setSelectedLinks(filteredAndSortedLinks.map(link => link.id));
    }
  };

  const handleBulkOperation = async (operation: "delete" | "favorite" | "unfavorite" | "categorize", category?: string) => {
    if (selectedLinks.length === 0) {
      toast({
        title: "Uyarı",
        description: "Lütfen en az bir link seçin.",
        status: "warning",
        duration: 2000,
        isClosable: true,
      });
      return;
    }

    try {
      const response = await apiClient.post("/links/bulk", {
        link_ids: selectedLinks,
        operation,
        category,
      });

      if (response.data.success) {
        toast({
          title: "Başarılı",
          description: response.data.message,
          status: "success",
          duration: 2000,
          isClosable: true,
        });
        setSelectedLinks([]);
        fetchUserLinks();
      }
    } catch (error: any) {
      toast({
        title: "Hata",
        description: error?.response?.data?.message || "Toplu işlem başarısız oldu.",
        status: "error",
        duration: 2000,
        isClosable: true,
      });
    }
  };


  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Tarih yok";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("tr-TR", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Geçersiz tarih";
    }
  };

  const filteredAndSortedLinks = useMemo(() => {
    let filtered = links;

    // Favori filtresi
    if (favoriteFilter === "favorites") {
      filtered = filtered.filter((link) => link.is_favorite === true);
    }

    // Kategori filtresi
    if (categoryFilter && categoryFilter !== "Tümü") {
      filtered = filtered.filter((link) => 
        (link.category || "Diğer") === categoryFilter
      );
    }

    // Arama filtresi
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((link) =>
        link.url.toLowerCase().includes(query) ||
        (link.title && link.title.toLowerCase().includes(query)) ||
        (link.category && link.category.toLowerCase().includes(query))
      );
    }

    const sorted = [...filtered].sort((a, b) => {
      const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
      const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
      
      if (sortOrder === "desc") {
        return dateB - dateA;
      } else {
        return dateA - dateB;
      }
    });

    return sorted;
  }, [links, searchQuery, categoryFilter, sortOrder, favoriteFilter]);

  if (!user) {
    return null;
  }

  // Grid icon component (since GridIcon doesn't exist in Chakra UI)
  const GridIconView = () => (
    <Icon viewBox="0 0 24 24" w={5} h={5}>
      <path
        fill="currentColor"
        d="M3 3h8v8H3V3zm10 0h8v8h-8V3zM3 13h8v8H3v-8zm10 0h8v8h-8v-8z"
      />
    </Icon>
  );

  // List icon component (since ListIcon can only be used inside List component)
  const ListIconView = () => (
    <Icon viewBox="0 0 24 24" w={5} h={5}>
      <path
        fill="currentColor"
        d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zm0-10v2h14V7H7z"
      />
    </Icon>
  );

  return (
    <Box bg={bgColor} minH="100vh" p={6}>
      <Box maxW="1400px" mx="auto">
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
                  <Icon as={LinkIcon} w={6} h={6} color="white" />
                </Box>
                <VStack align="start" spacing={0}>
                  <Heading size="xl" color={headingColor} fontWeight="bold">
                    LinkPin
                  </Heading>
                  <Text fontSize="sm" color="gray.500">
                    Linklerim
                  </Text>
                </VStack>
              </HStack>
              <HStack spacing={2} flexWrap="wrap">
                <Button
                  variant="outline"
                  colorScheme="purple"
                  onClick={handleBackToDashboard}
                  borderRadius="lg"
                  _hover={{
                    bg: "purple.50",
                    transform: "translateY(-2px)",
                  }}
                  transition="all 0.2s"
                >
                  Dashboard'a Dön
                </Button>
                <Button
                  colorScheme="purple"
                  onClick={onOpen}
                  leftIcon={<AddIcon />}
                  bgGradient="linear(to-r, purple.500, pink.500)"
                  _hover={{
                    bgGradient: "linear(to-r, purple.600, pink.600)",
                    transform: "translateY(-2px)",
                    boxShadow: "xl",
                  }}
                  transition="all 0.2s"
                  borderRadius="lg"
                >
                  Yeni Link Ekle
                </Button>
              </HStack>
            </HStack>
          </CardBody>
        </Card>

        <Card
          boxShadow="xl"
          borderRadius="2xl"
          bg={cardBg}
          mb={6}
          border="1px solid"
          borderColor={borderColor}
        >
          <CardBody p={6}>
            <HStack spacing={4} mb={4} flexWrap="wrap">
              <InputGroup flex={1} minW="200px">
                <InputLeftElement pointerEvents="none">
                  <SearchIcon color="gray.400" />
                </InputLeftElement>
                <Input
                  placeholder="Linklerde ara..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  size="lg"
                  borderRadius="lg"
                  _focus={{
                    borderColor: "purple.500",
                    boxShadow: "0 0 0 1px var(--chakra-colors-purple-500)",
                  }}
                />
              </InputGroup>
              <Select
                value={favoriteFilter}
                onChange={(e) => setFavoriteFilter(e.target.value as "all" | "favorites")}
                width="150px"
                borderRadius="lg"
                size="lg"
              >
                <option value="all">Tüm Linkler</option>
                <option value="favorites">⭐ Favoriler</option>
              </Select>
              <Select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                width="180px"
                borderRadius="lg"
                size="lg"
              >
                <option value="Tümü">Tüm Kategoriler</option>
                {LINK_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </Select>
              <Select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as "asc" | "desc")}
                width="200px"
                borderRadius="lg"
                size="lg"
              >
                <option value="desc">Yeniden Eskiye</option>
                <option value="asc">Eskiden Yeniye</option>
              </Select>
              <HStack spacing={2}>
                <IconButton
                  aria-label="List view"
                  icon={<ListIconView />}
                  onClick={() => setViewMode("list")}
                  colorScheme={viewMode === "list" ? "purple" : "gray"}
                  variant={viewMode === "list" ? "solid" : "outline"}
                  borderRadius="lg"
                />
                <IconButton
                  aria-label="Grid view"
                  icon={<GridIconView />}
                  onClick={() => setViewMode("grid")}
                  colorScheme={viewMode === "grid" ? "purple" : "gray"}
                  variant={viewMode === "grid" ? "solid" : "outline"}
                  borderRadius="lg"
                />
              </HStack>
            </HStack>
            {selectedLinks.length > 0 && (
              <Box
                mt={4}
                p={4}
                bgGradient="linear(to-r, purple.50, pink.50)"
                _dark={{ bgGradient: "linear(to-r, purple.900, pink.900)" }}
                borderRadius="lg"
                border="1px solid"
                borderColor="purple.200"
                className="fade-in"
              >
                <HStack spacing={3} flexWrap="wrap">
                  <Badge
                    colorScheme="purple"
                    fontSize="md"
                    px={3}
                    py={1}
                    borderRadius="full"
                  >
                    {selectedLinks.length} link seçildi
                  </Badge>
                  <Button
                    size="sm"
                    colorScheme="red"
                    onClick={() => handleBulkOperation("delete")}
                    borderRadius="lg"
                  >
                    Seçilenleri Sil
                  </Button>
                  <Button
                    size="sm"
                    colorScheme="yellow"
                    onClick={() => handleBulkOperation("favorite")}
                    borderRadius="lg"
                  >
                    Favorilere Ekle
                  </Button>
                  <Button
                    size="sm"
                    colorScheme="gray"
                    onClick={() => handleBulkOperation("unfavorite")}
                    borderRadius="lg"
                  >
                    Favorilerden Çıkar
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedLinks([])}
                    borderRadius="lg"
                  >
                    Seçimi Temizle
                  </Button>
                </HStack>
              </Box>
            )}
          </CardBody>
        </Card>

        <Card
          boxShadow="xl"
          borderRadius="2xl"
          bg={cardBg}
          border="1px solid"
          borderColor={borderColor}
        >
          <CardBody p={0}>
            {isLoading ? (
              <Box p={8}>
                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <Card key={i} variant="outline">
                      <CardBody>
                        <Skeleton height="20px" mb={2} />
                        <SkeletonText mt="4" noOfLines={2} spacing="4" />
                      </CardBody>
                    </Card>
                  ))}
                </SimpleGrid>
              </Box>
            ) : links.length === 0 ? (
              <Center p={12}>
                <VStack spacing={6}>
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
                      Henüz link eklenmemiş
                    </Heading>
                    <Text color="gray.500" fontSize="md" textAlign="center">
                      İlk linkinizi ekleyerek başlayın
                    </Text>
                  </VStack>
                  <Button
                    colorScheme="purple"
                    onClick={handleCreate}
                    size="lg"
                    leftIcon={<AddIcon />}
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
              </Center>
            ) : filteredAndSortedLinks.length === 0 ? (
              <Center p={12}>
                <VStack spacing={6}>
                  <Box
                    p={6}
                    borderRadius="full"
                    bgGradient="linear(to-r, purple.100, pink.100)"
                    _dark={{ bgGradient: "linear(to-r, purple.900, pink.900)" }}
                  >
                    <Icon as={SearchIcon} w={12} h={12} color="purple.600" />
                  </Box>
                  <VStack spacing={2}>
                    <Heading size="md" color={headingColor}>
                      Sonuç bulunamadı
                    </Heading>
                    <Text color="gray.500" fontSize="md" textAlign="center">
                      Arama kriterlerinize uygun link bulunamadı
                    </Text>
                  </VStack>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchQuery("");
                      setCategoryFilter("Tümü");
                      setFavoriteFilter("all");
                    }}
                    colorScheme="purple"
                    borderRadius="lg"
                  >
                    Filtreleri Temizle
                  </Button>
                </VStack>
              </Center>
            ) : viewMode === "grid" ? (
              <Box p={6}>
                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
                  {filteredAndSortedLinks.map((link) => (
                    <Card
                      key={link.id}
                      variant="outline"
                      className="hover-lift"
                      borderColor={borderColor}
                      _hover={{
                        borderColor: "purple.300",
                        boxShadow: "xl",
                      }}
                      transition="all 0.2s"
                    >
                      <CardBody>
                        <VStack align="stretch" spacing={3}>
                          <HStack justify="space-between">
                            <Checkbox
                              isChecked={selectedLinks.includes(link.id)}
                              onChange={() => handleSelectLink(link.id)}
                            />
                            <IconButton
                              aria-label="Toggle favorite"
                              icon={<StarIcon />}
                              size="sm"
                              colorScheme={link.is_favorite ? "yellow" : "gray"}
                              variant={link.is_favorite ? "solid" : "ghost"}
                              onClick={() => handleToggleFavorite(link.id)}
                            />
                          </HStack>
                          {link.title && (
                            <Heading size="sm" noOfLines={2}>
                              {link.title}
                            </Heading>
                          )}
                          <Badge
                            colorScheme={CATEGORY_COLORS[link.category || "Diğer"] || "gray"}
                            fontSize="xs"
                            alignSelf="flex-start"
                            borderRadius="full"
                            px={2}
                            py={1}
                          >
                            {link.category || "Diğer"}
                          </Badge>
                          <Text
                            as="a"
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            color="purple.600"
                            fontSize="sm"
                            noOfLines={2}
                            _hover={{ textDecoration: "underline" }}
                          >
                            {link.url}
                          </Text>
                          <Text fontSize="xs" color="gray.500">
                            {formatDate(link.created_at)}
                          </Text>
                          <Divider />
                          <HStack spacing={2} justify="flex-end">
                            <IconButton
                              aria-label="Copy link"
                              icon={<CopyIcon />}
                              size="sm"
                              colorScheme="gray"
                              variant="ghost"
                              onClick={() => handleCopyLink(link.url)}
                            />
                            <IconButton
                              aria-label="View link"
                              icon={<ViewIcon />}
                              size="sm"
                              colorScheme="blue"
                              variant="ghost"
                              onClick={() => handleView(link.url)}
                            />
                            <IconButton
                              aria-label="Edit link"
                              icon={<EditIcon />}
                              size="sm"
                              colorScheme="purple"
                              variant="ghost"
                              onClick={() => handleEdit(link)}
                            />
                            <IconButton
                              aria-label="Delete link"
                              icon={<DeleteIcon />}
                              size="sm"
                              colorScheme="red"
                              variant="ghost"
                              onClick={() => handleDeleteClick(link)}
                              isLoading={isDeleting === link.id}
                            />
                          </HStack>
                        </VStack>
                      </CardBody>
                    </Card>
                  ))}
                </SimpleGrid>
              </Box>
            ) : (
              <Box overflowX="auto">
                <Table variant="simple" size="md">
                  <Thead bg={theadBg}>
                    <Tr>
                      <Th w="50px"></Th>
                      <Th>BAŞLIK/AÇIKLAMA</Th>
                      <Th>KATEGORİ</Th>
                      <Th>URL</Th>
                      <Th>
                        <HStack spacing={1}>
                          <Text>OLUŞTURULMA</Text>
                          {sortOrder === "desc" ? (
                            <ChevronDownIcon />
                          ) : (
                            <ChevronUpIcon />
                          )}
                        </HStack>
                      </Th>
                      <Th textAlign="right">İŞLEMLER</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {filteredAndSortedLinks.map((link) => (
                      <Tr
                        key={link.id}
                        _hover={{
                          bg: tableHoverBg,
                        }}
                        transition="background-color 0.2s"
                      >
                        <Td>
                          <Checkbox
                            isChecked={selectedLinks.includes(link.id)}
                            onChange={() => handleSelectLink(link.id)}
                            colorScheme="purple"
                          />
                        </Td>
                        <Td>
                          <HStack spacing={2}>
                            {link.is_favorite && (
                              <StarIcon color="yellow.400" boxSize={4} />
                            )}
                            <Text
                              fontWeight={link.title ? "semibold" : "normal"}
                              color={link.title ? (colorMode === "light" ? "gray.800" : "gray.100") : "gray.400"}
                              fontStyle={link.title ? "normal" : "italic"}
                              maxW="250px"
                              isTruncated
                            >
                              {link.title || "Açıklama yok"}
                            </Text>
                          </HStack>
                        </Td>
                        <Td>
                          <Badge
                            colorScheme={CATEGORY_COLORS[link.category || "Diğer"] || "gray"}
                            fontSize="sm"
                            px={3}
                            py={1}
                            borderRadius="full"
                          >
                            {link.category || "Diğer"}
                          </Badge>
                        </Td>
                        <Td>
                          <Text
                            as="a"
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            color="purple.600"
                            _hover={{ textDecoration: "underline" }}
                            maxW="400px"
                            isTruncated
                            fontSize="sm"
                          >
                            {link.url}
                          </Text>
                        </Td>
                        <Td>
                          <Text fontSize="sm" color="gray.500">
                            {formatDate(link.created_at)}
                          </Text>
                        </Td>
                        <Td>
                          <HStack justify="flex-end" spacing={1}>
                            <Tooltip label={link.is_favorite ? "Favorilerden çıkar" : "Favorilere ekle"}>
                              <IconButton
                                aria-label="Toggle favorite"
                                icon={<StarIcon />}
                                size="sm"
                                colorScheme={link.is_favorite ? "yellow" : "gray"}
                                variant={link.is_favorite ? "solid" : "ghost"}
                                onClick={() => handleToggleFavorite(link.id)}
                                borderRadius="md"
                              />
                            </Tooltip>
                            <Tooltip label="Linki Kopyala">
                              <IconButton
                                aria-label="Copy link"
                                icon={<CopyIcon />}
                                size="sm"
                                colorScheme="gray"
                                variant="ghost"
                                onClick={() => handleCopyLink(link.url)}
                                borderRadius="md"
                              />
                            </Tooltip>
                            <Tooltip label="Linki Aç">
                              <IconButton
                                aria-label="View link"
                                icon={<ViewIcon />}
                                size="sm"
                                colorScheme="blue"
                                variant="ghost"
                                onClick={() => handleView(link.url)}
                                borderRadius="md"
                              />
                            </Tooltip>
                            <Tooltip label="Düzenle">
                              <IconButton
                                aria-label="Edit link"
                                icon={<EditIcon />}
                                size="sm"
                                colorScheme="purple"
                                variant="ghost"
                                onClick={() => handleEdit(link)}
                                borderRadius="md"
                              />
                            </Tooltip>
                            <Tooltip label="Sil">
                              <IconButton
                                aria-label="Delete link"
                                icon={<DeleteIcon />}
                                size="sm"
                                colorScheme="red"
                                variant="ghost"
                                onClick={() => handleDeleteClick(link)}
                                isLoading={isDeleting === link.id}
                                borderRadius="md"
                              />
                            </Tooltip>
                          </HStack>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>
            )}
          </CardBody>
        </Card>

      </Box>

      <Modal isOpen={isOpen} onClose={handleModalClose} size="lg">
        <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(4px)" />
        <ModalContent borderRadius="2xl">
          <ModalHeader
            bgGradient="linear(to-r, purple.600, pink.600)"
            bgClip="text"
            fontWeight="bold"
            fontSize="xl"
          >
            {editingLink ? "Link Düzenle" : "Yeni Link Ekle"}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={5}>
              <FormControl>
                <FormLabel fontWeight="semibold">Başlık / Açıklama</FormLabel>
                <Input
                  placeholder="Örn: İş için önemli kaynak, Kişisel blog, vs."
                  value={linkTitle}
                  onChange={(e) => setLinkTitle(e.target.value)}
                  maxLength={255}
                  size="lg"
                  borderRadius="lg"
                  _focus={{
                    borderColor: "purple.500",
                    boxShadow: "0 0 0 1px var(--chakra-colors-purple-500)",
                  }}
                />
                <Text fontSize="xs" color="gray.500" mt={1}>
                  Bu linki ne amaçla eklediğinizi açıklayın (opsiyonel)
                </Text>
              </FormControl>

              <FormControl>
                <FormLabel fontWeight="semibold">Kategori</FormLabel>
                <Select
                  value={linkCategory}
                  onChange={(e) => setLinkCategory(e.target.value)}
                  size="lg"
                  borderRadius="lg"
                >
                  {LINK_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel fontWeight="semibold">URL *</FormLabel>
                <Input
                  placeholder="https://example.com"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  onBlur={(e) => {
                    const url = e.target.value.trim();
                    if (url && !url.startsWith("http://") && !url.startsWith("https://")) {
                      setLinkUrl("https://" + url);
                    }
                  }}
                  size="lg"
                  borderRadius="lg"
                  _focus={{
                    borderColor: "purple.500",
                    boxShadow: "0 0 0 1px var(--chakra-colors-purple-500)",
                  }}
                />
                {linkUrl && !validateUrl(linkUrl).isValid && (
                  <Text fontSize="sm" color="red.500" mt={1}>
                    {validateUrl(linkUrl).error}
                  </Text>
                )}
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="ghost"
              mr={3}
              onClick={handleModalClose}
              borderRadius="lg"
            >
              İptal
            </Button>
            <Button
              colorScheme="purple"
              onClick={handleSaveLink}
              isLoading={isSaving}
              loadingText="Kaydediliyor..."
              bgGradient="linear(to-r, purple.500, pink.500)"
              _hover={{
                bgGradient: "linear(to-r, purple.600, pink.600)",
              }}
              borderRadius="lg"
            >
              {editingLink ? "Güncelle" : "Ekle"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <AlertDialog
        isOpen={isDeleteOpen}
        leastDestructiveRef={cancelRef}
        onClose={onDeleteClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Linki Sil
            </AlertDialogHeader>

            <AlertDialogBody>
              Bu linki silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
              <Text mt={2} fontWeight="medium" color="gray.600">
                {linkToDelete?.url}
              </Text>
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onDeleteClose}>
                İptal
              </Button>
              <Button
                colorScheme="red"
                onClick={handleDeleteConfirm}
                ml={3}
                isLoading={isDeleting === linkToDelete?.id}
              >
                Sil
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
};

export default LinksPage;

