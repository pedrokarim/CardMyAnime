#!/usr/bin/env node

/**
 * Utilitaire de logging mensuel réutilisable
 * Crée un fichier de log par mois et nettoie automatiquement les anciens logs
 */

const fs = require('fs').promises;
const path = require('path');

class MonthlyLogger {
    constructor(options = {}) {
        this.logsDir = options.logsDir || path.join(__dirname, '../../logs');
        this.maxMonthsToKeep = options.maxMonthsToKeep || 20;
        this.currentLogFile = null;
        this.currentMonth = null;
    }

    /**
     * Initialise le logger et nettoie les anciens logs
     */
    async initialize() {
        // Créer le dossier logs s'il n'existe pas
        try {
            await fs.mkdir(this.logsDir, { recursive: true });
        } catch (error) {
            if (error.code !== 'EEXIST') {
                throw error;
            }
        }

        // Déterminer le fichier de log du mois actuel
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        this.currentMonth = `${year}-${month}`;
        this.currentLogFile = path.join(this.logsDir, `${this.currentMonth}.log`);

        // Nettoyer les anciens logs
        await this.cleanupOldLogs();
    }

    /**
     * Nettoie les anciens fichiers de logs selon maxMonthsToKeep
     */
    async cleanupOldLogs() {
        try {
            const files = await fs.readdir(this.logsDir);
            const logFiles = files
                .filter(file => file.match(/^\d{4}-\d{2}\.log$/))
                .sort()
                .reverse(); // Plus récent en premier

            // Garder seulement les N derniers mois
            const filesToKeep = logFiles.slice(0, this.maxMonthsToKeep);
            const filesToDelete = logFiles.slice(this.maxMonthsToKeep);

            for (const file of filesToDelete) {
                const filePath = path.join(this.logsDir, file);
                try {
                    await fs.unlink(filePath);
                    console.log(`🗑️  Ancien log supprimé: ${file}`);
                } catch (error) {
                    console.error(`⚠️  Erreur lors de la suppression de ${file}:`, error.message);
                }
            }

            if (filesToDelete.length > 0) {
                console.log(`🧹 Nettoyage: ${filesToDelete.length} ancien(s) fichier(s) de log supprimé(s)`);
            }
        } catch (error) {
            console.error('⚠️  Erreur lors du nettoyage des logs:', error.message);
        }
    }

    /**
     * Formate un message avec timestamp
     */
    formatMessage(level, message) {
        const timestamp = new Date().toISOString();
        return `[${timestamp}] [${level}] ${message}\n`;
    }

    /**
     * Écrit un message dans le fichier de log du mois actuel
     */
    async writeLog(level, message) {
        if (!this.currentLogFile) {
            await this.initialize();
        }

        const logMessage = this.formatMessage(level, message);

        try {
            await fs.appendFile(this.currentLogFile, logMessage, 'utf8');
        } catch (error) {
            console.error(`❌ Erreur lors de l'écriture dans le log:`, error.message);
        }
    }

    /**
     * Log un message d'information
     */
    async info(message) {
        await this.writeLog('INFO', message);
        console.log(message);
    }

    /**
     * Log un message de succès
     */
    async success(message) {
        await this.writeLog('SUCCESS', message);
        console.log(message);
    }

    /**
     * Log un message d'erreur
     */
    async error(message, error = null) {
        const errorMessage = error
            ? `${message}\n${error.stack || error.message}`
            : message;
        await this.writeLog('ERROR', errorMessage);
        console.error(message);
        if (error) {
            console.error(error);
        }
    }

    /**
     * Log un message d'avertissement
     */
    async warn(message) {
        await this.writeLog('WARN', message);
        console.warn(message);
    }

    /**
     * Log un message de debug
     */
    async debug(message) {
        await this.writeLog('DEBUG', message);
        if (process.env.NODE_ENV === 'development') {
            console.debug(message);
        }
    }

    /**
     * Log le début d'une opération
     */
    async startOperation(operationName) {
        const message = `🚀 Début de l'opération: ${operationName}`;
        await this.writeLog('INFO', message);
        console.log(message);
    }

    /**
     * Log la fin d'une opération
     */
    async endOperation(operationName, success = true) {
        const emoji = success ? '✅' : '❌';
        const level = success ? 'SUCCESS' : 'ERROR';
        const message = `${emoji} Fin de l'opération: ${operationName} - ${success ? 'Succès' : 'Échec'}`;
        await this.writeLog(level, message);
        console.log(message);
    }

    /**
     * Log des statistiques
     */
    async stats(statsObject) {
        const message = `📊 Statistiques:\n${JSON.stringify(statsObject, null, 2)}`;
        await this.writeLog('INFO', message);
        console.log('📊 Statistiques:');
        for (const [key, value] of Object.entries(statsObject)) {
            console.log(`   - ${key}: ${value}`);
        }
    }

    /**
     * Retourne le chemin du fichier de log actuel
     */
    getCurrentLogFile() {
        return this.currentLogFile;
    }

    /**
     * Retourne le mois actuel (format YYYY-MM)
     */
    getCurrentMonth() {
        return this.currentMonth;
    }
}

module.exports = MonthlyLogger;

