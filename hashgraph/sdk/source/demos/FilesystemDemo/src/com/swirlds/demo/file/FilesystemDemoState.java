package com.swirlds.demo.file;

/*
 * This file is public domain.
 *
 * SWIRLDS MAKES NO REPRESENTATIONS OR WARRANTIES ABOUT THE SUITABILITY OF
 * THE SOFTWARE, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED
 * TO THE IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
 * PARTICULAR PURPOSE, OR NON-INFRINGEMENT. SWIRLDS SHALL NOT BE LIABLE FOR
 * ANY DAMAGES SUFFERED AS A RESULT OF USING, MODIFYING OR
 * DISTRIBUTING THIS SOFTWARE OR ITS DERIVATIVES.
 */

import com.swirlds.fs.FCFileSystem;
import com.swirlds.platform.Address;
import com.swirlds.platform.AddressBook;
import com.swirlds.platform.FCDataInputStream;
import com.swirlds.platform.FCDataOutputStream;
import com.swirlds.platform.FastCopyable;
import com.swirlds.platform.Platform;
import com.swirlds.platform.SwirldState;
import com.swirlds.platform.SwirldState.SwirldState2;
import com.swirlds.platform.Transaction;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.temporal.ChronoUnit;

/**
 * The state is primarily a Fast Copyable Filesystem.
 * A transaction is an update to the filesystem.
 * For now, that takes the form of a filename and its contents.
 */
public class FilesystemDemoState implements SwirldState2 {

	/** This version number should be used to handle compatibility issues that may arise from any future changes */
	private static final long VERSION = 1;

	/** the platform running this app */
	private Platform platform;
	/** the names and addresses of all members */
	private AddressBook addressBook;
	/** the fast copyable filesystem storing all the files */
	private FCFileSystem fs;

	/** @return the current filesystem */
	public synchronized FCFileSystem getFS() {
		return fs;
	}

	/**
	 * @param pathname
	 * 		the path name, including the file name, in the fast copyable filesystem
	 * @return the text inside the file
	 * @throws IOException
	 * 		problems with the files and streams
	 */
	public synchronized String fileContents(String pathname)
			throws IOException {
		return new String(fs.fileRead(pathname), StandardCharsets.UTF_8);
	}

	/** @return a copy of the current address book */
	public synchronized AddressBook getAddressBookCopy() {
		return addressBook.copy();
	}

	public synchronized FastCopyable copy() {
		FilesystemDemoState copy = new FilesystemDemoState();
		copy.copyFrom(this);
		return copy;
	}

	public synchronized void copyTo(FCDataOutputStream outStream)
			throws IOException {
		// Write the version number
		outStream.writeLong(VERSION);

		addressBook.copyTo(outStream);
		fs.copyTo(outStream);
	}

	public synchronized void copyFrom(FCDataInputStream inStream)
			throws IOException {
		// Discard the version number
		inStream.readLong();

		addressBook.copyFrom(inStream);
		fs = new FCFileSystem();
		fs.copyFrom(inStream);
	}

	public synchronized void copyFrom(SwirldState old) {
		FilesystemDemoState old1 = (FilesystemDemoState) old;
		platform = old1.platform;
		addressBook = old1.addressBook.copy();
		fs = old1.fs.copy();
	}

	/**
	 * Create (or replace) a file whose pathname and contents are described in
	 * the transaction. Any intermediate directories that don't already exist
	 * locally are created first.
	 *
	 * {@inheritDoc}
	 */
	public synchronized void handleTransaction(
			long id, boolean consensus,
			Instant timeCreated, Instant timestamp,
			Transaction transaction, Address address) {
		if (consensus) {
			try {
				FileTransaction tx = FileTransaction.deserialize(transaction.getContents());
				// if (fs.resolvePath(tx.pathname).isEmpty())
				// throw new IllegalArgumentException("empty pathname");
				// XXX set to expire a year from its created
				fs.fileCreate(tx.pathname, tx.text.getBytes(StandardCharsets.UTF_8), timestamp.getEpochSecond(),
						timestamp.getNano(), timestamp.plus(365, ChronoUnit.DAYS).getEpochSecond(), null);
			} catch (IOException e) {
				throw new RuntimeException(e);
			}
		}
	}

	public void noMoreTransactions() {
	}

	public void expandSignatures(Transaction trans) {
	}

	public synchronized void init(Platform platform, AddressBook addressBook) {
		this.platform = platform;
		this.addressBook = addressBook;
		fs = new FCFileSystem();
	}

	public synchronized void delete() {
		fs.delete();
	}
}