import { IsInt, IsMimeType, IsString, IsUUID, Min } from 'class-validator';

export class InitiateUploadDto { @IsUUID() ticketId!: string; @IsString() fileName!: string; @IsMimeType() contentType!: string; @IsInt() @Min(1) contentLength!: number }
export class CompleteUploadDto { @IsUUID() ticketId!: string; @IsString() storageKey!: string }
export class ListAttachmentsQueryDto { @IsUUID() ticketId!: string; page?: number; pageSize?: number }

