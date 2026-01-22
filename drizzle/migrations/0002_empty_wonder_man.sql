ALTER TABLE "documents" ADD COLUMN "converted_storage_key" text;--> statement-breakpoint
ALTER TABLE "documents" ADD COLUMN "converted_mime_type" text;--> statement-breakpoint
ALTER TABLE "documents" ADD COLUMN "converted_at" timestamp;--> statement-breakpoint
ALTER TABLE "documents" ADD COLUMN "external_task_id" text;--> statement-breakpoint
ALTER TABLE "documents" ADD COLUMN "processing_error" text;