CREATE TABLE "users" (
  "id" UUID PRIMARY KEY,
  "username" VARCHAR(255) UNIQUE,
  "email" VARCHAR(255) UNIQUE,
  "phone" VARCHAR(255) UNIQUE,
  "full_name" VARCHAR(255),
  "date_of_birth" DATE,
  "avatar_url" VARCHAR(255),
  "bio" TEXT,
  "auth_provider" VARCHAR(255) NOT NULL,
  "is_verified" BOOLEAN NOT NULL DEFAULT false,
  "is_private" BOOLEAN NOT NULL DEFAULT false,
  "is_profile_complete" BOOLEAN NOT NULL DEFAULT false,
  "created_at" TIMESTAMP NOT NULL DEFAULT (NOW()),
  "updated_at" TIMESTAMP NOT NULL DEFAULT (NOW())
);

CREATE TABLE "user_location" (
  "id" UUID PRIMARY KEY,
  "user_id" UUID NOT NULL,
  "lat" DECIMAL NOT NULL,
  "lng" DECIMAL NOT NULL,
  "place_name" VARCHAR(255),
  "last_updated" TIMESTAMP NOT NULL DEFAULT (NOW())
);

CREATE TABLE "user_devices" (
  "id" UUID PRIMARY KEY,
  "user_id" UUID NOT NULL,
  "fcm_token" VARCHAR(255) NOT NULL,
  "device_name" VARCHAR(255) NOT NULL,
  "device_os" VARCHAR(255) NOT NULL,
  "last_active" TIMESTAMP NOT NULL DEFAULT (NOW())
);

CREATE TABLE "follows" (
  "id" UUID PRIMARY KEY,
  "follower_id" UUID NOT NULL,
  "following_id" UUID NOT NULL,
  "created_at" TIMESTAMP NOT NULL DEFAULT (NOW())
);

CREATE TABLE "user_blocks" (
  "id" UUID PRIMARY KEY,
  "blocker_id" UUID NOT NULL,
  "blocked_id" UUID NOT NULL,
  "created_at" TIMESTAMP NOT NULL DEFAULT (NOW())
);

CREATE TABLE "posts" (
  "id" UUID PRIMARY KEY,
  "user_id" UUID NOT NULL,
  "content" TEXT,
  "post_type" VARCHAR(255) NOT NULL,
  "broadcast_id" UUID,
  "visibility" VARCHAR(255) NOT NULL DEFAULT 'public',
  "location_type" VARCHAR(255),
  "lat" DECIMAL,
  "lng" DECIMAL,
  "place_name" VARCHAR(255),
  "is_deleted" BOOLEAN NOT NULL DEFAULT false,
  "likes_count" BIGINT NOT NULL DEFAULT 0,
  "comments_count" BIGINT NOT NULL DEFAULT 0,
  "reposts_count" BIGINT NOT NULL DEFAULT 0,
  "views_count" BIGINT NOT NULL DEFAULT 0,
  "created_at" TIMESTAMP NOT NULL DEFAULT (NOW()),
  "updated_at" TIMESTAMP NOT NULL DEFAULT (NOW())
);

CREATE TABLE "post_media" (
  "id" UUID PRIMARY KEY,
  "post_id" UUID NOT NULL,
  "url" VARCHAR(255) NOT NULL,
  "media_type" VARCHAR(255) NOT NULL,
  "order_index" INTEGER NOT NULL DEFAULT 0,
  "created_at" TIMESTAMP NOT NULL DEFAULT (NOW())
);

CREATE TABLE "post_extensions" (
  "id" UUID PRIMARY KEY,
  "post_id" UUID UNIQUE NOT NULL,
  "event_starts_at" TIMESTAMP,
  "event_ends_at" TIMESTAMP,
  "event_venue" VARCHAR(255),
  "poll_expires_at" TIMESTAMP,
  "job_title" VARCHAR(255),
  "job_company" VARCHAR(255),
  "price" DECIMAL,
  "item_condition" VARCHAR(255),
  "lf_type" VARCHAR(255),
  "is_resolved" BOOLEAN NOT NULL DEFAULT false
);

CREATE TABLE "comments" (
  "id" UUID PRIMARY KEY,
  "post_id" UUID NOT NULL,
  "user_id" UUID NOT NULL,
  "parent_id" UUID,
  "content" TEXT,
  "created_at" TIMESTAMP DEFAULT (NOW())
);

CREATE TABLE "likes" (
  "id" UUID PRIMARY KEY,
  "user_id" UUID NOT NULL,
  "post_id" UUID NOT NULL,
  "created_at" TIMESTAMP NOT NULL DEFAULT (NOW())
);

CREATE TABLE "bookmarks" (
  "id" UUID PRIMARY KEY,
  "user_id" UUID NOT NULL,
  "post_id" UUID NOT NULL,
  "created_at" TIMESTAMP NOT NULL DEFAULT (NOW())
);

CREATE TABLE "poll_options" (
  "id" UUID PRIMARY KEY,
  "post_id" UUID NOT NULL,
  "option_text" VARCHAR(255) NOT NULL
);

CREATE TABLE "poll_votes" (
  "id" UUID PRIMARY KEY,
  "option_id" UUID NOT NULL,
  "user_id" UUID NOT NULL,
  "created_at" TIMESTAMP NOT NULL DEFAULT (NOW())
);

CREATE TABLE "hashtags" (
  "id" UUID PRIMARY KEY,
  "name" VARCHAR(255) UNIQUE NOT NULL,
  "created_at" TIMESTAMP NOT NULL DEFAULT (NOW())
);

CREATE TABLE "post_hashtags" (
  "post_id" UUID NOT NULL,
  "hashtag_id" UUID NOT NULL,
  PRIMARY KEY ("post_id", "hashtag_id")
);

CREATE TABLE "broadcasts" (
  "id" UUID PRIMARY KEY,
  "creator_id" UUID NOT NULL,
  "title" VARCHAR(255) NOT NULL,
  "type" VARCHAR(255) NOT NULL,
  "lat" DECIMAL NOT NULL,
  "lng" DECIMAL NOT NULL,
  "radius_meters" INTEGER NOT NULL DEFAULT 100,
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMP NOT NULL DEFAULT (NOW())
);

CREATE TABLE "broadcast_messages" (
  "id" UUID PRIMARY KEY,
  "broadcast_id" UUID NOT NULL,
  "sender_id" UUID NOT NULL,
  "parent_id" UUID,
  "content" TEXT NOT NULL,
  "is_accepted" BOOLEAN NOT NULL DEFAULT false,
  "upvote_count" INTEGER NOT NULL DEFAULT 0,
  "downvote_count" INTEGER NOT NULL DEFAULT 0,
  "created_at" TIMESTAMP NOT NULL DEFAULT (NOW())
);

CREATE TABLE "broadcast_votes" (
  "id" UUID PRIMARY KEY,
  "message_id" UUID NOT NULL,
  "user_id" UUID NOT NULL,
  "vote_type" SMALLINT NOT NULL
);

CREATE TABLE "broadcast_media" (
  "id" UUID PRIMARY KEY,
  "message_id" UUID NOT NULL,
  "url" VARCHAR(255) NOT NULL,
  "media_type" VARCHAR(255) NOT NULL,
  "created_at" TIMESTAMP NOT NULL DEFAULT (NOW())
);

CREATE TABLE "notifications" (
  "id" UUID PRIMARY KEY,
  "recipient_id" UUID NOT NULL,
  "actor_id" UUID NOT NULL,
  "type" VARCHAR(255) NOT NULL,
  "post_id" UUID,
  "comment_id" UUID,
  "broadcast_id" UUID,
  "message_id" UUID,
  "is_read" BOOLEAN NOT NULL DEFAULT false,
  "created_at" TIMESTAMP NOT NULL DEFAULT (NOW())
);

CREATE TABLE "reports" (
  "id" SERIAL PRIMARY KEY,
  "reporter_id" UUID NOT NULL,
  "target_type" VARCHAR(255) NOT NULL,
  "target_id" UUID NOT NULL,
  "reason" VARCHAR(255) NOT NULL,
  "status" VARCHAR(255) NOT NULL DEFAULT 'PENDING'
);

ALTER TABLE "user_location" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "user_devices" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "follows" ADD FOREIGN KEY ("follower_id") REFERENCES "users" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "follows" ADD FOREIGN KEY ("following_id") REFERENCES "users" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "user_blocks" ADD FOREIGN KEY ("blocker_id") REFERENCES "users" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "user_blocks" ADD FOREIGN KEY ("blocked_id") REFERENCES "users" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "posts" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "post_media" ADD FOREIGN KEY ("post_id") REFERENCES "posts" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "post_extensions" ADD FOREIGN KEY ("post_id") REFERENCES "posts" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "comments" ADD FOREIGN KEY ("post_id") REFERENCES "posts" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "comments" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "comments" ADD FOREIGN KEY ("parent_id") REFERENCES "comments" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "likes" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "likes" ADD FOREIGN KEY ("post_id") REFERENCES "posts" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "bookmarks" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "bookmarks" ADD FOREIGN KEY ("post_id") REFERENCES "posts" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "poll_options" ADD FOREIGN KEY ("post_id") REFERENCES "posts" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "poll_votes" ADD FOREIGN KEY ("option_id") REFERENCES "poll_options" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "poll_votes" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "post_hashtags" ADD FOREIGN KEY ("post_id") REFERENCES "posts" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "post_hashtags" ADD FOREIGN KEY ("hashtag_id") REFERENCES "hashtags" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "broadcasts" ADD FOREIGN KEY ("creator_id") REFERENCES "users" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "broadcast_messages" ADD FOREIGN KEY ("broadcast_id") REFERENCES "broadcasts" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "broadcast_messages" ADD FOREIGN KEY ("sender_id") REFERENCES "users" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "broadcast_messages" ADD FOREIGN KEY ("parent_id") REFERENCES "broadcast_messages" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "broadcast_votes" ADD FOREIGN KEY ("message_id") REFERENCES "broadcast_messages" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "broadcast_votes" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "broadcast_media" ADD FOREIGN KEY ("message_id") REFERENCES "broadcast_messages" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "notifications" ADD FOREIGN KEY ("recipient_id") REFERENCES "users" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "notifications" ADD FOREIGN KEY ("actor_id") REFERENCES "users" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "reports" ADD FOREIGN KEY ("reporter_id") REFERENCES "users" ("id") DEFERRABLE INITIALLY IMMEDIATE;
