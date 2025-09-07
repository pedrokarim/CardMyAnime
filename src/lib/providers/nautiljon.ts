import { UserData } from "../types";
import { JSDOM } from "jsdom";

const NAUTILJON_BASE_URL = "https://www.nautiljon.com";

export async function fetchUserData(username: string): Promise<UserData> {
  try {
    // Fetch user profile page
    const profileUrl = `${NAUTILJON_BASE_URL}/membre/profil,${username}.html`;
    const response = await fetch(profileUrl);

    if (!response.ok) {
      throw new Error("Utilisateur non trouvé");
    }

    const html = await response.text();
    const dom = new JSDOM(html);
    const document = dom.window.document;

    // Extract basic information
    const extractedUsername = extractUsername(document);
    const avatarUrl = extractAvatarUrl(document);
    const personalMessage = extractPersonalMessage(document);
    const role = extractRole(document);

    // Extract detailed profile information
    const profileInfo = extractProfileInfo(document);

    // Extract statistics from different sections
    const collectionsStats = extractCollectionsStats(document);
    const nautilisteStats = extractNautilisteStats(document);
    const watchlistStats = extractWatchlistStats(document);
    const detailedStats = extractDetailedStats(document);

    // Extract recent items
    const recentCollections = extractRecentItems(document, "collections");
    const recentNautiliste = extractRecentItems(document, "nautiliste");
    const recentWatchlist = extractRecentItems(document, "watchlist");

    // Extract top 5 lists
    const top5 = extractTop5(document);

    // Extract interests
    const interests = extractInterests(document);

    // Extract badges
    const badges = extractBadges(document);

    // Extract contacts
    const contacts = extractContacts(document);

    // Extract comments info
    const commentsInfo = extractCommentsInfo(document);

    return {
      username: extractedUsername,
      avatarUrl,
      personalMessage,
      role,
      profile: {
        ...profileInfo,
        joinDate: profileInfo.memberSince,
        lastActive: profileInfo.lastVisit,
        location: profileInfo.location,
      },
      stats: {
        // Collections (possédés)
        collections: collectionsStats,
        // Nauti'liste (vus)
        animesSeen: nautilisteStats.animes || 0,
        mangasRead:
          (nautilisteStats.mangas || 0) + (nautilisteStats.mangaVolumes || 0),
        // Bloc-notes (à voir)
        planToWatchCount: watchlistStats.animes || 0,
        planToReadCount:
          (watchlistStats.mangas || 0) + (watchlistStats.mangaVolumes || 0),
        // Detailed stats
        totalEpisodes: detailedStats.animes || 0,
        totalChapters: detailedStats.mangas || 0,
        commentsCount: profileInfo.comments || 0,
        notesCount: profileInfo.notes || 0,
        forumMessagesCount: profileInfo.forumMessages || 0,
        avgScore: 0, // Nautiljon doesn't provide average scores easily
      },
      lastAnimes: recentNautiliste.animes || [],
      lastMangas: recentNautiliste.mangas || [],
      favorites: {
        anime: top5.animes || [],
        manga: top5.mangas || [],
        characters: top5.personalities || [],
      },
      achievements: badges,
      interests: interests,
      contacts: contacts,
      commentsInfo: commentsInfo,
      // Additional Nautiljon-specific data
      collections: collectionsStats,
      nautiliste: nautilisteStats,
      watchlist: watchlistStats,
      detailedStats: detailedStats,
    };
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des données Nautiljon:",
      error
    );
    throw new Error("Impossible de récupérer les données utilisateur");
  }
}

function extractUsername(document: Document): string {
  const usernameElement = document.querySelector("#profil_pseudo h1");
  return usernameElement?.textContent?.trim().replace("Profil de ", "") || "";
}

function extractAvatarUrl(document: Document): string {
  const avatarElement = document.querySelector("#avatar img.avatar");
  let avatarUrl = avatarElement?.getAttribute("src") || "";

  if (avatarUrl) {
    avatarUrl = avatarUrl.split("?")[0];
    if (!avatarUrl.startsWith("http")) {
      if (avatarUrl.startsWith("//")) {
        avatarUrl = `https:${avatarUrl}`;
      } else if (avatarUrl.startsWith("/")) {
        avatarUrl = `${NAUTILJON_BASE_URL}${avatarUrl}`;
      } else {
        avatarUrl = `${NAUTILJON_BASE_URL}/${avatarUrl}`;
      }
    }
  }

  return avatarUrl;
}

function extractPersonalMessage(document: Document): string {
  const messageElement = document.querySelector("#profil_msg_perso");
  return messageElement?.textContent?.trim() || "";
}

function extractRole(document: Document): string {
  const roleElement = document.querySelector(".infos_small");
  return roleElement?.textContent?.trim() || "";
}

function extractProfileInfo(document: Document) {
  const info: any = {};

  const rows = document.querySelectorAll("#membre_infos table tr");
  rows.forEach((row) => {
    const cells = row.querySelectorAll("td");
    if (cells.length >= 2) {
      const label = cells[0]?.textContent?.trim().replace(":", "");
      const value = cells[1]?.textContent?.trim();

      if (label && value) {
        switch (label) {
          case "Genre":
            info.gender = value;
            break;
          case "Dernière visite":
            info.lastVisit = value.replace(/\s*\([^)]*\)/, ""); // Remove (Hors ligne)
            break;
          case "Membre depuis":
            const datePart = value.split(" ")[0]; // Just the date
            // Essayer de parser la date et la formater correctement
            try {
              const parsedDate = new Date(datePart);
              if (!isNaN(parsedDate.getTime())) {
                info.memberSince = parsedDate.toISOString().split("T")[0]; // Format YYYY-MM-DD
              } else {
                info.memberSince = datePart; // Garder le format original si parsing échoue
              }
            } catch {
              info.memberSince = datePart; // Garder le format original si erreur
            }
            info.memberDays = parseInt(
              value.match(/\((\d+) jours\)/)?.[1] || "0"
            );
            break;
          case "Localisation":
            info.location = value;
            break;
          case "Commentaires":
            info.comments = parseInt(value) || 0;
            break;
          case "Notes":
            info.notes = parseInt(value) || 0;
            break;
          case "Messages sur forum":
            info.forumMessages = parseInt(value) || 0;
            break;
        }
      }
    }
  });

  return info;
}

function extractCollectionsStats(document: Document) {
  const stats: any = {};

  const collectionsSection = document.querySelector("#onglets_2_possede");
  if (collectionsSection) {
    const totalElement = collectionsSection.querySelector(".list_total a");
    const totalText = totalElement?.textContent?.trim();
    if (totalText) {
      stats.total = parseInt(totalText.match(/(\d+)/)?.[1] || "0");
    }

    const listItems = collectionsSection.querySelectorAll(".list_type li");
    listItems.forEach((item) => {
      const numberElement = item.querySelector(".list_number");
      const sectionElement = item.querySelector(".list_section");
      if (numberElement && sectionElement) {
        const number = parseInt(numberElement.textContent || "0");
        const section = sectionElement.textContent?.trim();
        if (section) {
          stats[section.toLowerCase().replace(/\s+/g, "")] = number;
        }
      }
    });
  }

  return stats;
}

function extractNautilisteStats(document: Document) {
  const stats: any = {};

  const nautilisteSection = document.querySelector("#onglets_2_vu");
  if (nautilisteSection) {
    const totalElement = nautilisteSection.querySelector(".list_total a");
    const totalText = totalElement?.textContent?.trim();
    if (totalText) {
      stats.total = parseInt(totalText.match(/(\d+)/)?.[1] || "0");
    }

    const listItems = nautilisteSection.querySelectorAll(".list_type li");
    listItems.forEach((item) => {
      const numberElement = item.querySelector(".list_number");
      const sectionElement = item.querySelector(".list_section");
      if (numberElement && sectionElement) {
        const number = parseInt(numberElement.textContent || "0");
        const section = sectionElement.textContent?.trim();
        if (section) {
          stats[section.toLowerCase().replace(/\s+/g, "")] = number;
        }
      }
    });
  }

  return stats;
}

function extractWatchlistStats(document: Document) {
  const stats: any = {};

  const watchlistSection = document.querySelector("#onglets_2_a-voir");
  if (watchlistSection) {
    const totalElement = watchlistSection.querySelector(".list_total a");
    const totalText = totalElement?.textContent?.trim();
    if (totalText) {
      stats.total = parseInt(totalText.match(/(\d+)/)?.[1] || "0");
    }

    const listItems = watchlistSection.querySelectorAll(".list_type li");
    listItems.forEach((item) => {
      const numberElement = item.querySelector(".list_number");
      const sectionElement = item.querySelector(".list_section");
      if (numberElement && sectionElement) {
        const number = parseInt(numberElement.textContent || "0");
        const section = sectionElement.textContent?.trim();
        if (section) {
          stats[section.toLowerCase().replace(/\s+/g, "")] = number;
        }
      }
    });
  }

  return stats;
}

function extractDetailedStats(document: Document) {
  const stats: any = {};

  const statsTable = document.querySelector("#membre_stats table");
  if (statsTable) {
    const rows = statsTable.querySelectorAll("tr");
    rows.forEach((row) => {
      const cells = row.querySelectorAll("td");
      if (cells.length >= 2) {
        const label = cells[0]?.textContent?.trim();
        const value = cells[1]?.textContent?.trim();

        if (label && value) {
          const cleanLabel = label
            .split("(")[0]
            .trim()
            .toLowerCase()
            .replace(/\s+/g, "");
          const number = parseInt(value.match(/(\d+)/)?.[1] || "0");
          stats[cleanLabel] = number;
        }
      }
    });
  }

  return stats;
}

function extractRecentItems(document: Document, section: string) {
  const items: any = { animes: [], mangas: [] };

  let selector = "";
  switch (section) {
    case "collections":
      selector = "#onglets_2_possede .slide-inner";
      break;
    case "nautiliste":
      selector = "#onglets_2_vu .slide-inner";
      break;
    case "watchlist":
      selector = "#onglets_2_a-voir .slide-inner";
      break;
  }

  const slideInner = document.querySelector(selector);
  if (slideInner) {
    const links = slideInner.querySelectorAll("a");
    links.forEach((link) => {
      const title = link.getAttribute("title") || "";
      const img = link.querySelector("img");
      let coverUrl = img?.getAttribute("src") || "";

      if (coverUrl) {
        coverUrl = coverUrl.split("?")[0];
        if (!coverUrl.startsWith("http")) {
          if (coverUrl.startsWith("//")) {
            coverUrl = `https:${coverUrl}`;
          } else if (coverUrl.startsWith("/")) {
            coverUrl = `${NAUTILJON_BASE_URL}${coverUrl}`;
          } else {
            coverUrl = `${NAUTILJON_BASE_URL}/${coverUrl}`;
          }
        }
      }

      const cleanTitle = title.replace(
        /^(Anime|Manga|Volume de manga|Volume de light novel|Goodies|Light novel) : /,
        ""
      );

      if (title.includes("Anime :")) {
        items.animes.push({ title: cleanTitle, coverUrl });
      } else if (
        title.includes("Manga :") ||
        title.includes("Volume de manga :")
      ) {
        items.mangas.push({ title: cleanTitle, coverUrl });
      }
    });
  }

  return items;
}

function extractTop5(document: Document) {
  const top5: any = {};

  const categories = ["anime", "drama", "manga", "people", "generic"];
  categories.forEach((category) => {
    const section = document.querySelector(`#onglets_1_${category}`);
    if (section) {
      const items: any[] = [];
      const tops = section.querySelectorAll(".untop");
      tops.forEach((top) => {
        const link = top.querySelector("a");
        const img = top.querySelector("img");
        const pos = top.querySelector(".pos");

        if (link && img) {
          const title = link.getAttribute("title") || "";
          let coverUrl = img.getAttribute("src") || "";
          const position = pos?.textContent?.trim() || "";

          if (coverUrl) {
            coverUrl = coverUrl.split("?")[0];
            if (!coverUrl.startsWith("http")) {
              if (coverUrl.startsWith("//")) {
                coverUrl = `https:${coverUrl}`;
              } else if (coverUrl.startsWith("/")) {
                coverUrl = `${NAUTILJON_BASE_URL}${coverUrl}`;
              } else {
                coverUrl = `${NAUTILJON_BASE_URL}/${coverUrl}`;
              }
            }
          }

          items.push({ title, coverUrl, position: parseInt(position) });
        }
      });
      top5[category === "people" ? "personalities" : category + "s"] = items;
    }
  });

  return top5;
}

function extractInterests(document: Document) {
  const interests: any = {};

  const interestTables = document.querySelectorAll(
    "#membre_interets .unInteret"
  );
  interestTables.forEach((table) => {
    const header = table.querySelector("th");
    const category = header?.textContent?.trim() || "";

    if (category) {
      interests[category.toLowerCase()] = {};
      const rows = table.querySelectorAll("tr");
      rows.forEach((row) => {
        const cells = row.querySelectorAll("td");
        if (cells.length >= 2) {
          const interest = cells[0]?.textContent?.trim();
          const stars = cells[1]?.querySelectorAll(".font-star_on").length || 0;

          if (interest) {
            interests[category.toLowerCase()][interest.toLowerCase()] = stars;
          }
        }
      });
    }
  });

  return interests;
}

function extractBadges(document: Document) {
  const badges: any[] = [];

  // Chercher la section badges de plusieurs façons
  let badgeSection: Element | null = null;

  // Méthode 1: Chercher par h2 avec "Badges"
  const h2Elements = document.querySelectorAll("h2");
  for (const h2 of h2Elements) {
    if (
      h2.textContent?.includes("Badges") ||
      h2.textContent?.includes("Succès")
    ) {
      badgeSection = h2;
      break;
    }
  }

  // Méthode 2: Chercher par classe ou ID spécifique
  if (!badgeSection) {
    badgeSection = document.querySelector(".badges, #badges, .succes, #succes");
  }

  // Méthode 3: Chercher dans les sections de contenu
  if (!badgeSection) {
    const sections = document.querySelectorAll("section, div");
    for (const section of sections) {
      const text = section.textContent || "";
      if (
        text.includes("Badges") ||
        text.includes("Succès") ||
        text.includes("badges")
      ) {
        badgeSection = section;
        break;
      }
    }
  }

  if (badgeSection) {
    // Chercher les images de badges dans la section
    const badgeImages = badgeSection.querySelectorAll("img");

    badgeImages.forEach((img) => {
      const title = img.getAttribute("title") || img.getAttribute("alt") || "";
      const src = img.getAttribute("src") || "";
      const isUnlocked =
        !img.classList.contains("opa") && !img.classList.contains("locked");

      // Nettoyer l'URL de l'image
      let cleanSrc = src;
      if (cleanSrc) {
        cleanSrc = cleanSrc.split("?")[0]; // Enlever les paramètres
        if (!cleanSrc.startsWith("http")) {
          if (cleanSrc.startsWith("//")) {
            cleanSrc = `https:${cleanSrc}`;
          } else if (cleanSrc.startsWith("/")) {
            cleanSrc = `${NAUTILJON_BASE_URL}${cleanSrc}`;
          } else {
            cleanSrc = `${NAUTILJON_BASE_URL}/${cleanSrc}`;
          }
        }
      }

      // Créer un nom propre pour le badge
      let badgeName = title;
      if (!badgeName && src) {
        // Extraire le nom du fichier et le nettoyer
        const fileName = src.split("/").pop()?.split(".")[0] || "";
        badgeName = fileName
          .replace(/_/g, " ")
          .replace(/\d+/g, "")
          .replace(/badge/g, "")
          .replace(/badges/g, "")
          .replace(/succes/g, "")
          .replace(/compte/g, "")
          .replace(/collection/g, "")
          .trim();

        // Si le nom est vide après nettoyage, utiliser un nom générique
        if (!badgeName) {
          badgeName = "Badge Nautiljon";
        }
      }

      // Ajouter seulement si on a des informations valides
      if (badgeName && cleanSrc) {
        badges.push({
          name: badgeName,
          description: title || badgeName,
          icon: cleanSrc,
          unlocked: isUnlocked,
        });
      }
    });

    // Si on n'a pas trouvé d'images, chercher des liens ou du texte
    if (badges.length === 0) {
      const badgeLinks = badgeSection.querySelectorAll("a");
      badgeLinks.forEach((link) => {
        const text = link.textContent?.trim();
        const href = link.getAttribute("href");

        if (text && text.length > 0 && text.length < 100) {
          // Éviter le texte trop long
          badges.push({
            name: text,
            description: text,
            icon: "", // Pas d'icône pour les liens texte
            unlocked: true,
          });
        }
      });
    }
  }

  // Si on n'a toujours rien trouvé, essayer une recherche globale
  if (badges.length === 0) {
    const allImages = document.querySelectorAll("img");
    allImages.forEach((img) => {
      const src = img.getAttribute("src") || "";
      const title = img.getAttribute("title") || img.getAttribute("alt") || "";

      // Chercher les images qui ressemblent à des badges
      if (
        src.includes("badge") ||
        src.includes("badges") ||
        src.includes("succes") ||
        title.includes("badge") ||
        title.includes("succès")
      ) {
        let cleanSrc = src.split("?")[0];
        if (!cleanSrc.startsWith("http")) {
          if (cleanSrc.startsWith("//")) {
            cleanSrc = `https:${cleanSrc}`;
          } else if (cleanSrc.startsWith("/")) {
            cleanSrc = `${NAUTILJON_BASE_URL}${cleanSrc}`;
          } else {
            cleanSrc = `${NAUTILJON_BASE_URL}/${cleanSrc}`;
          }
        }

        const badgeName =
          title || src.split("/").pop()?.split(".")[0] || "Badge";

        badges.push({
          name: badgeName,
          description: title || badgeName,
          icon: cleanSrc,
          unlocked: !img.classList.contains("opa"),
        });
      }
    });
  }

  return badges;
}

function extractContacts(document: Document) {
  const contacts: any[] = [];

  const contactSection = document.querySelector("#membre_contacts");
  if (contactSection) {
    const contactList = contactSection.querySelector("#contactList");
    if (contactList) {
      const members = contactList.querySelectorAll(".unMembre");
      members.forEach((member) => {
        const link = member.querySelector("a");
        const img = member.querySelector("img");

        if (link && img) {
          const username = link.textContent?.trim() || "";
          let avatarUrl = img.getAttribute("src") || "";

          if (avatarUrl) {
            avatarUrl = avatarUrl.split("?")[0];
            if (!avatarUrl.startsWith("http")) {
              if (avatarUrl.startsWith("//")) {
                avatarUrl = `https:${avatarUrl}`;
              } else if (avatarUrl.startsWith("/")) {
                avatarUrl = `${NAUTILJON_BASE_URL}${avatarUrl}`;
              } else {
                avatarUrl = `${NAUTILJON_BASE_URL}/${avatarUrl}`;
              }
            }
          }

          contacts.push({ username, avatarUrl });
        }
      });
    }
  }

  return contacts;
}

function extractCommentsInfo(document: Document) {
  const commentsSection = document.querySelector("#comments");
  if (commentsSection) {
    const title = commentsSection.querySelector("h3");
    const totalText = title?.textContent?.match(/\((\d+)\)/)?.[1];
    const total = parseInt(totalText || "0");

    return {
      total,
      hasNotifications: !!commentsSection.querySelector("#surveille"),
    };
  }

  return { total: 0, hasNotifications: false };
}
