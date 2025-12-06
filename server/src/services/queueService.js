import { prisma } from "../../prisma.js";

const Enqueue = async (serverId, type, payload = {}) => {
    return await prisma.serverQueue.create({
        data: {
            serverId: parseInt(serverId),
            type,
            payload,
            status: "PENDING"
        }
    });
};

const GetNextPending = async () => {
    return await prisma.serverQueue.findFirst({
        where: {
            status: "PENDING",
            server: {
                serverid: parseInt(process.env.SERVER_ID)
            }
        },
        orderBy: { createdAt: "asc" },
        include: { server: { include: { gameVersion: { include: { game: true, getFilesSetup: true, changeFileAfterSetup: true } }, sysUser: true } } }
    });
};

const UpdateStatus = async (id, status, logs = null) => {
    const data = { status };
    if (logs) {
        data.logs = logs;
    }
    return await prisma.serverQueue.update({
        where: { id },
        data
    });
};

const GetQueueItem = async (id) => {
    return await prisma.serverQueue.findUnique({
        where: { id: parseInt(id) }
    });
};

const QueueService = {
    Enqueue,
    GetNextPending,
    UpdateStatus,
    GetQueueItem
};

export default QueueService;
