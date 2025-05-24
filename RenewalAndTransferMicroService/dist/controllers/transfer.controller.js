"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTransfer = createTransfer;
exports.approveTransfer = approveTransfer;
exports.getTransfers = getTransfers;
exports.getTransfer = getTransfer;
// @desc Create a transfer
// @route POST /api/transfers
function createTransfer(req, res, next) {
    res.send("<h1>POST /api/transfers</h1>");
}
// @desc Approve a transfer
// @route PUT /api/transfers
function approveTransfer(req, res, next) {
    res.send("<h1>PUT /api/transfers</h1>");
}
// @desc Get all transfers for a user (HOD | DRM)
// @route GET /api/transfers
function getTransfers(req, res, next) {
    res.send("<h1>GET /api/transfers</h1>");
}
// @desc Get all transfers for a user (HOD | DRM)
// @route GET /api/transfers
function getTransfer(req, res, next) {
    res.send("<h1>GET /api/transfers/:id</h1>");
}
