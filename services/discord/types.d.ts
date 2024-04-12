import { APIUser } from 'discord-api-types/v10';
import { JWTPayload } from 'jose';

interface DiscordToken extends JWTPayload, APIUser {}
