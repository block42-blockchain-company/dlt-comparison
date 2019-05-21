
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
import com.swirlds.platform.Transaction;

import java.io.IOException;
import java.time.Instant;

/**
 * The state for the hashgraph demo. See the comments for com.swirlds.demos.HashgraphDemoMain
 */
public class HashgraphDemoState implements SwirldState {

	/** This version number should be used to handle compatibility issues that may arise from any future changes */
	private static final long VERSION = 1;

	/** all of names and addresses of members */
	private AddressBook addressBook;

	// ///////////////////////////////////////////////////////////////////

	@Override
	public synchronized void init(Platform platform, AddressBook addressBook) {
		this.addressBook = addressBook;
	}

	;

	@Override
	public synchronized AddressBook getAddressBookCopy() {
		return addressBook.copy();
	}

	;

	@Override
	public synchronized void copyFrom(SwirldState state) {
		addressBook = ((HashgraphDemoState) state).addressBook;
	}

	@Override
	public synchronized void handleTransaction(long id, boolean isConsensus,
			Instant timeCreated, Instant timestamp, Transaction trans,
			Address address) {
	}

	@Override
	public synchronized void noMoreTransactions() {
	}

	@Override
	public void expandSignatures(Transaction trans) {

	}

	@Override
	public synchronized FastCopyable copy() {
		HashgraphDemoState copy = new HashgraphDemoState();
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
	public void delete() {
		// nothing to clean up
	}
}
