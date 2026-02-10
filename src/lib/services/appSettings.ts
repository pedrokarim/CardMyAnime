import { prisma, ensurePrismaConnection } from "@/lib/prisma";

const DEFAULTS: Record<string, string> = {
  cacheExpiration: "24",
  maxLogsRetention: "30",
  enableNotifications: "true",
  maintenanceMode: "false",
  snapshotIntervalHours: "6",
  snapshotEnabled: "true",
};

class AppSettingsService {
  private static instance: AppSettingsService;

  private constructor() {}

  public static getInstance(): AppSettingsService {
    if (!AppSettingsService.instance) {
      AppSettingsService.instance = new AppSettingsService();
    }
    return AppSettingsService.instance;
  }

  async get(key: string): Promise<string> {
    await ensurePrismaConnection();
    const setting = await prisma.appSettings.findUnique({ where: { key } });
    return setting?.value ?? DEFAULTS[key] ?? "";
  }

  async getAll(): Promise<Record<string, string>> {
    await ensurePrismaConnection();
    const settings = await prisma.appSettings.findMany();
    const result = { ...DEFAULTS };
    for (const s of settings) {
      result[s.key] = s.value;
    }
    return result;
  }

  async set(key: string, value: string): Promise<void> {
    await ensurePrismaConnection();
    await prisma.appSettings.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });
  }

  async setMany(entries: Record<string, string>): Promise<void> {
    await ensurePrismaConnection();
    const operations = Object.entries(entries).map(([key, value]) =>
      prisma.appSettings.upsert({
        where: { key },
        update: { value },
        create: { key, value },
      })
    );
    await prisma.$transaction(operations);
  }
}

export const appSettings = AppSettingsService.getInstance();
