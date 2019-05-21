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

import com.swirlds.fs.internal.Hash;
import com.swirlds.platform.Browser;
import com.swirlds.platform.Platform;
import com.swirlds.platform.PlatformStatus;
import com.swirlds.platform.SwirldMain;
import com.swirlds.platform.SwirldState;

import java.util.Arrays;
import java.util.Date;

/**
 * A simple text editor application that saves its files to a Swirlds Fast Copyable Filesystem. Every save
 * is a transaction propagated across the network to peers. Thus, the filesystem is kept synchronized across
 * all nodes.
 */
public class FilesystemDemoMain implements SwirldMain {
	/** the platform running this app */
	public Platform platform;
	/** the ID number for this member */
	private long selfId;

	/**
	 * This is just for debugging: it allows the app to run in Eclipse. If the config.txt exists and lists a
	 * particular SwirldMain class as the one to run, then it can run in Eclipse (with the green triangle
	 * icon).
	 *
	 * @param args
	 * 		these are not used
	 */
	public static void main(String[] args) {
		// FilesystemFC.bgLoad();
		Browser.main(args);
	}

	public void preEvent() {
	}

	public void init(Platform platform, long id) {
		this.platform = platform;
		this.selfId = id;
		platform.setAbout("Filesystem Demo v. 1.0\n"); // set the browser's "about" box
		platform.setSleepAfterSync(250); // milliseconds
	}

	/**
	 * Start the text editor GUI. Then update its status bar every time the underlying filesystem is found
	 * to have changed, indicating that files have arrived from the network (or local node).
	 */
	public void run() {
		try {
			TextEditor wp = TextEditor.openOn(platform);
			byte[] fsHash = fsHash();
			while (true) {
				Thread.sleep(1000);
				byte[] newHash = fsHash();
				if (!Arrays.equals(fsHash, newHash))
					wp.status(String.format("filesystem changed at %s",
							new Date()));
				fsHash = newHash;
			}
		} catch (InterruptedException e) {
			System.err.println(String.format("[FilesystemDemo %d] interrupted",
					selfId));
		}
	}

	/** @return The hash of (the root directory of) the fast copyable filesystem */
	private byte[] fsHash() {
		try {
			Hash hash = ((FilesystemDemoState) platform.getState()).getFS().getHash();
			return hash == null ? new byte[0] : hash.getValue();
		} finally {
			platform.releaseState();
		}
	}

	public SwirldState newState() {
		return new FilesystemDemoState();
	}

	@Override
	public void platformStatusChange(PlatformStatus newStatus) {

	}
}
