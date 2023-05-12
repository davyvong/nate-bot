import { APIUser } from 'discord-api-types/v10';
import type { JWTPayload } from 'jose';

interface DiscordToken extends JWTPayload, APIUser {}
