import cron from "node-cron";
import fs from "fs";
import fsp from "fs/promises";
import path from "path";
import { Writable } from "stream";
import LogEntry from "../models/logEntry.model"; // Import the Mongoose model

/**
 * Archives all logs for a specific day from MongoDB to a .log file.
 * The logs are streamed from the database to the file to handle large volumes of data
 * without consuming excessive memory.
 *
 * @param date The day for which to archive logs.
 */
const archiveLogsForDate = async (date: Date): Promise<void> => {
  console.log(
    `[Archiver] Starting log archival process for ${
      date.toISOString().split("T")[0]
    }`
  );

  // 1. Calculate the date range for the query (the entire day in UTC)
  const startOfDay = new Date(date);
  startOfDay.setUTCHours(0, 0, 0, 0);

  const endOfDay = new Date(date);
  endOfDay.setUTCHours(23, 59, 59, 999);

  // 2. Prepare the file path and ensure the directory exists
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const logDirectory = path.join(
    process.cwd(),
    "logs",
    String(year),
    String(month)
  );
  const logFilePath = path.join(logDirectory, `${day}.log`);

  await fsp.mkdir(logDirectory, { recursive: true });

  // 3. Create a writable stream to the log file. This will overwrite the file if it exists.
  const fileWriteStream = fs.createWriteStream(logFilePath, {
    encoding: "utf-8",
  });

  // 4. Create a readable stream (cursor) from the MongoDB query
  const mongoStream = LogEntry.find({
    timestamp: {
      $gte: startOfDay,
      $lte: endOfDay,
    },
  })
    .sort({ timestamp: "asc" }) // Sort logs chronologically
    .cursor(); // .cursor() returns a stream-like object

  let logCount = 0;

  try {
    // 5. Process the stream: for each log document, format and write it to the file
    for await (const logDoc of mongoStream) {
      // Format the log entry as a single line of JSON (JSONL format)
      const logLine = JSON.stringify(logDoc.toObject()) + "\n";
      fileWriteStream.write(logLine);
      logCount++;
    }

    console.log(
      `[Archiver] Successfully archived ${logCount} log entries to ${logFilePath}`
    );
  } catch (error) {
    console.error(
      `[Archiver] Error during log archival stream for ${logFilePath}:`,
      error
    );
  } finally {
    // 6. Ensure the file stream is closed
    fileWriteStream.end();
  }
};

/**
 * Initializes the scheduled job to archive logs every day at 23:59.
 */
export const initializeLogArchiverJob = () => {
  const schedule = "1 * * * * *"; // "59 23 * * *"; // "at 23:59 every day"

  console.log(`[Archiver] Scheduling daily log archival for ${schedule}.`);
  const today = new Date();

  setTimeout(() => {
    archiveLogsForDate(today);
  }, 100000);

  cron.schedule(
    schedule,
    () => {
      const today = new Date();
      console.log(
        `[Archiver] Kicking off scheduled job for ${
          today.toISOString().split("T")[0]
        }`
      );
      archiveLogsForDate(today);
    },
    {
      // scheduled: true,
      timezone: "Etc/UTC", // Run in UTC to align with server time
    }
  );
};
