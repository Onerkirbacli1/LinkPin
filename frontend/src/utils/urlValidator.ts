export const validateUrl = (url: string): { isValid: boolean; error: string } => {
  if (!url || !url.trim()) {
    return { isValid: false, error: "URL boş olamaz." };
  }

  const trimmedUrl = url.trim();

  if (trimmedUrl.length > 2048) {
    return { isValid: false, error: "URL çok uzun. Maksimum 2048 karakter olabilir." };
  }

  if (!trimmedUrl.startsWith("http://") && !trimmedUrl.startsWith("https://")) {
    return { isValid: false, error: "URL http:// veya https:// ile başlamalıdır." };
  }

  try {
    const urlObj = new URL(trimmedUrl);
    
    if (!urlObj.hostname) {
      return { isValid: false, error: "Geçersiz URL formatı. Domain adı bulunamadı." };
    }

    const domainPattern = /^([a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;
    
    if (!domainPattern.test(urlObj.hostname)) {
      return { isValid: false, error: "Geçersiz domain formatı." };
    }

    return { isValid: true, error: "" };
  } catch (error) {
    return { isValid: false, error: "Geçersiz URL formatı." };
  }
};

export const normalizeUrl = (url: string): string => {
  if (!url || !url.trim()) {
    return url;
  }

  const trimmed = url.trim();
  
  if (trimmed && !trimmed.startsWith("http://") && !trimmed.startsWith("https://")) {
    return "https://" + trimmed;
  }

  return trimmed;
};

