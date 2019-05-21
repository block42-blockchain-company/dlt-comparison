
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
import java.time.Instant;

/**
 * This demo collects statistics on the running of the network and consensus systems. It writes them to the
 * screen, and also saves them to disk in a comma separated value (.csv) file. Optionally, it can also put a
 * sequence number into each transaction, and check if any are lost, or delayed too long. Each transaction
 * is 100 random bytes. So StatsDemoState.handleTransaction doesn't actually do anything, other than the
 * optional sequence number check.
 */
public class StatsDemoState implements SwirldState2 {

	/** This version number should be used to handle compatibility issues that may arise from any future changes */
	private static final long VERSION = 1;

	/** the address book passed in by the Platform at the start */
	private AddressBook addressBook;

	@Override
	public synchronized AddressBook getAddressBookCopy() {
		return addressBook.copy();
	}

	@Override
	public synchronized FastCopyable copy() {
		StatsDemoState copy = new StatsDemoState();
		copy.copyFrom(this);
		return copy;
	}

	@Override
	public synchronized void copyTo(FCDataOutputStream outStream)
			throws IOException {
		// Write the version number
		outStream.writeLong(VERSION);

		addressBook.copyTo(outStream);
	}

	@Override
	public synchronized void copyFrom(FCDataInputStream inStream)
			throws IOException {
		// Discard the version number
		inStream.readLong();

		addressBook.copyFrom(inStream);
	}

	@Override
	public synchronized void copyFrom(SwirldState old) {
		StatsDemoState s = (StatsDemoState) old;
		addressBook = s.addressBook.copy();
	}

	@Override
	public synchronized void handleTransaction(long id, boolean consensus,
			Instant timeCreated, Instant timestamp, Transaction transaction,
			Address address) {
	}

	@Override
	public synchronized void noMoreTransactions() {
	}

	@Override
	public void expandSignatures(Transaction trans) {

	}

	@Override
	public synchronized void init(Platform platform, AddressBook addressBook) {
		this.addressBook = addressBook;
	}

	@Override
	public void delete() {
		// nothing to clean up
	}
}