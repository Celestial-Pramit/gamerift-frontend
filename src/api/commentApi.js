import { call, useMock } from "./http.js";
import { seedComments } from "../mock/mockPhase3.js";

// Backend CommentResponse -> the shape the Stream page already uses
export function normalizeComment(c) {
  return {
    id: c.id,
    streamId: c.streamId,
    user: c.user,
    pro: c.pro,
    text: c.text,
    parentId: c.parentId,
    pinned: c.pinned,
    locked: c.locked,
    edited: !!c.edited,
    likes: c.likesCount,
    liked: c.liked,
    mine: c.mine,
    at: c.createdAt,
    replies: (c.replies || []).map(normalizeComment),
  };
}

export async function getComments(streamId) {
  if (useMock) return seedComments.map((c) => ({ ...c, streamId: String(streamId), mine: false, liked: false }));
  const data = await call("get", "/comments?streamId=" + encodeURIComponent(streamId));
  return data.map(normalizeComment);
}

export async function postComment(streamId, text, parentId) {
  if (useMock) {
    const c = { id: Date.now(), user: "you", pro: false, text, likes: 0, pinned: false, mine: true, replies: [] };
    seedComments.unshift(c);
    return { ...c, streamId: String(streamId) };
  }
  return normalizeComment(await call("post", "/comments", { streamId, text, parentId }));
}

export async function setCommentLike(commentId, liked) {
  if (useMock) return { liked };
  return call("put", "/comments/" + commentId + "/like", { liked });
}

export async function deleteComment(commentId) {
  if (useMock) {
    const i = seedComments.findIndex((c) => c.id === commentId);
    if (i >= 0) seedComments.splice(i, 1);
    return;
  }
  return call("delete", "/comments/" + commentId);
}

// Edit your own comment (real mode only)
export async function editComment(commentId, text) {
  return normalizeComment(await call("put", "/comments/" + commentId, { text }));
}