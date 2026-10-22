<?php

namespace App\Services;

use Spatie\DbDumper\Databases\MySql;
use Spatie\DbDumper\Exceptions\CannotStartDump;
use Symfony\Component\Process\Process;

class CustomMySqlDumper extends MySql
{
    public function getProcess(string $dumpFile): Process
    {
        $tempFileHandle = $this->getTempFileHandle();

        if (! is_resource($tempFileHandle)) {
            throw CannotStartDump::emptyParameter('tempFileHandle');
        }

        fwrite($tempFileHandle, $this->getContentsOfCredentialsFile());
        $temporaryCredentialsFile = stream_get_meta_data($tempFileHandle)['uri'];

        $command = $this->getDumpCommand($dumpFile, $temporaryCredentialsFile);

        $env = null;
        if (PHP_OS_FAMILY === 'Windows') {
            $systemRoot = getenv('SystemRoot') ?: ($_SERVER['SystemRoot'] ?? 'C:\\Windows');
            $windir = getenv('windir') ?: ($_SERVER['windir'] ?? $systemRoot);
            $path = getenv('PATH') ?: ($_SERVER['PATH'] ?? '');

            $env = array_merge($_SERVER, [
                'SystemRoot' => $systemRoot,
                'windir' => $windir,
                'PATH' => $path,
            ]);
        }

        return Process::fromShellCommandline($command, null, $env, null, $this->timeout);
    }
}
