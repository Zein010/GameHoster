-- DropIndex
DROP INDEX `ChangeFileAfterSetup_gameVersionId_fkey` ON `changefileaftersetup`;

-- DropIndex
DROP INDEX `GameVersion_gameId_fkey` ON `gameversion`;

-- DropIndex
DROP INDEX `GetFilesSetup_gameVersionId_fkey` ON `getfilessetup`;

-- DropIndex
DROP INDEX `RunningServers_gameVersionId_fkey` ON `runningservers`;

-- DropIndex
DROP INDEX `RunningServers_serverid_fkey` ON `runningservers`;

-- DropIndex
DROP INDEX `RunningServers_sysUserId_fkey` ON `runningservers`;

-- DropIndex
DROP INDEX `RunningServers_userId_fkey` ON `runningservers`;

-- DropIndex
DROP INDEX `UserAccess_sysUserID_fkey` ON `useraccess`;

-- DropIndex
DROP INDEX `UserLoginHistory_userId_fkey` ON `userloginhistory`;

-- AddForeignKey
ALTER TABLE `UserLoginHistory` ADD CONSTRAINT `UserLoginHistory_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `GameVersion` ADD CONSTRAINT `GameVersion_gameId_fkey` FOREIGN KEY (`gameId`) REFERENCES `Game`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserAccess` ADD CONSTRAINT `UserAccess_sysUserID_fkey` FOREIGN KEY (`sysUserID`) REFERENCES `SysUser`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RunningServers` ADD CONSTRAINT `RunningServers_gameVersionId_fkey` FOREIGN KEY (`gameVersionId`) REFERENCES `GameVersion`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RunningServers` ADD CONSTRAINT `RunningServers_sysUserId_fkey` FOREIGN KEY (`sysUserId`) REFERENCES `SysUser`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RunningServers` ADD CONSTRAINT `RunningServers_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RunningServers` ADD CONSTRAINT `RunningServers_serverid_fkey` FOREIGN KEY (`serverid`) REFERENCES `Server`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `GetFilesSetup` ADD CONSTRAINT `GetFilesSetup_gameVersionId_fkey` FOREIGN KEY (`gameVersionId`) REFERENCES `GameVersion`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ChangeFileAfterSetup` ADD CONSTRAINT `ChangeFileAfterSetup_gameVersionId_fkey` FOREIGN KEY (`gameVersionId`) REFERENCES `GameVersion`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
