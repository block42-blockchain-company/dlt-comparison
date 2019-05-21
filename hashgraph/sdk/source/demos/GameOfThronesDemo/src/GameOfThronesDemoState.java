
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
import com.swirlds.platform.Utilities;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

/**
 * This holds the current state of the swirld. For this simple "hello swirld" code, each transaction is just
 * a string, and the state is just a list of the strings in all the transactions handled so far, in the
 * order that they were handled.
 */
public class GameOfThronesDemoState implements SwirldState {

	/** This version number should be used to handle compatibility issues that may arise from any future changes */
	private static final long VERSION = 1;

	/**
	 * The shared state is just a list of the strings in all transactions, listed in the order received
	 * here, which will eventually be the consensus order of the community.
	 */
	//private List<String> strings = new ArrayList<String>();
	private String[] alliances;
	private String[] families;
	private String[] connect_families_to_alliance;
	/** names and addresses of all members */
	private AddressBook addressBook;

	/** @return all the strings received so far from the network */
	/*public synchronized List<String> getStrings() {
		return strings;
	}*/

	public synchronized String[] getAlliances() {
		return alliances;
	}

	public synchronized String[] getFamilies() {
		return families;
	}

	public synchronized String[] getConnect_families_to_alliance() {
		return connect_families_to_alliance;
	}

	/** @return all the strings received so far from the network, concatenated into one */
	/*public synchronized String getReceived() {
		return strings.toString();
	}*/
	public synchronized String getReceivedAlliance() {
		return alliances[0];
	}


	/** @return the same as getReceived, so it returns the entire shared state as a single string */
	/*public synchronized String toString() {
		return strings.toString();
	}*/
	public synchronized String toString() {
		return alliances.toString();
	}

	// ///////////////////////////////////////////////////////////////////

	@Override
	public synchronized AddressBook getAddressBookCopy() {
		return addressBook.copy();
	}

	@Override
	public synchronized FastCopyable copy() {
		GameOfThronesDemoState copy = new GameOfThronesDemoState();
		copy.copyFrom(this);
		return copy;
	}

	@Override
	public synchronized void copyTo(FCDataOutputStream outStream) {
		try {
			// Write the version number
			outStream.writeLong(VERSION);

			//Utilities.writeStringArray(outStream, strings.toArray(new String[0]));
			Utilities.writeStringArray(outStream, alliances);
			Utilities.writeStringArray(outStream, families);
			Utilities.writeStringArray(outStream, connect_families_to_alliance);

		} catch (IOException e) {
			e.printStackTrace();
		}
	}

	@Override
	public synchronized void copyFrom(FCDataInputStream inStream) {
		try {
			// Discard the version number
			inStream.readLong();

			//strings = new ArrayList<String>(Arrays.asList(Utilities.readStringArray(inStream)));
			alliances = Utilities.readStringArray(inStream);
			families = Utilities.readStringArray(inStream);
			connect_families_to_alliance = Utilities.readStringArray(inStream);
		} catch (IOException e) {
			e.printStackTrace();
		}
	}

	@Override
	public synchronized void copyFrom(SwirldState old) {
		//strings = new ArrayList<String>(((GameOfThronesDemoState) old).strings);
		alliances = Arrays.copyOf(((GameOfThronesDemoState) old).alliances, ((GameOfThronesDemoState) old).alliances.length);
		families = Arrays.copyOf(((GameOfThronesDemoState) old).families, ((GameOfThronesDemoState) old).families.length);
		connect_families_to_alliance = Arrays.copyOf(((GameOfThronesDemoState) old).connect_families_to_alliance, ((GameOfThronesDemoState) old).connect_families_to_alliance.length);
		addressBook = ((GameOfThronesDemoState) old).addressBook.copy();
	}

	@Override
	public synchronized void handleTransaction(long id, boolean consensus,
			Instant timeCreated, Instant timestamp, Transaction transaction,
			Address address) {

		String family = new String(transaction.getContents(), StandardCharsets.UTF_8);

		for (int i = 0; i < families.length; i++) {
			if(family.equals(families[i])) {
				String alliance = connect_families_to_alliance[i];
				if(alliance.equals(alliances[0])) {
					connect_families_to_alliance[i] = alliances[1];
				} else if(alliance.equals(alliances[1])) {
					connect_families_to_alliance[i] = alliances[0];
				}
			}
		}
	}

	@Override
	public void noMoreTransactions() {
	}

	@Override
	public void expandSignatures(Transaction trans) {

	}

	@Override
	public synchronized void init(Platform platform, AddressBook addressBook) {
		this.addressBook = addressBook;
		this.alliances = new String[]{"Khaleesi", "Cercei"};
		this.families = new String[]{"Stark", "Targaryen", "Lannister", "Greyjoy", "Tyrell", "Martell", "Tully", "Arryn"};
		this.connect_families_to_alliance = new String[]{"Khaleesi", "Khaleesi", "Cercei", "Cercei", "Cercei", "Khaleesi", "Khaleesi", "Khaleesi"};
	}

	@Override
	public void delete() {
		// nothing to clean up
	}
}