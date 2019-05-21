
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

import com.swirlds.platform.Browser;
import com.swirlds.platform.Console;
import com.swirlds.platform.Platform;
import com.swirlds.platform.PlatformStatus;
import com.swirlds.platform.SwirldMain;
import com.swirlds.platform.SwirldState;
import com.swirlds.platform.Transaction;

import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.Random;

/**
 * This HelloSwirld creates a single transaction, consisting of the string "Hello Swirld", and then goes
 * into a busy loop (checking once a second) to see when the state gets the transaction. When it does, it
 * prints it, too.
 */
public class GameOfThronesDemoMain implements SwirldMain {
	/** the platform running this app */
	public Platform platform;
	/** ID number for this member */
	public long selfId;
	/** a console window for text output */
	public Console console;
	/** sleep this many milliseconds after each sync */
	public final int sleepPeriod = 100;

	/**
	 * This is just for debugging: it allows the app to run in Eclipse. If the config.txt exists and lists a
	 * particular SwirldMain class as the one to run, then it can run in Eclipse (with the green triangle
	 * icon).
	 *
	 * @param args
	 * 		these are not used
	 */
	public static void main(String[] args) {
		Browser.main(args);
	}

	// ///////////////////////////////////////////////////////////////////

	@Override
	public void preEvent() {
	}

	@Override
	public void init(Platform platform, long id) {
		this.platform = platform;
		this.selfId = id;
		this.console = platform.createConsole(true); // create the window, make it visible
		platform.setAbout("Game of Thrones v. 1.0\n"); // set the browser's "about" box
		platform.setSleepAfterSync(sleepPeriod);
	}

	@Override
	public void run() {
		String myName;
		try {
			myName = platform.getState().getAddressBookCopy()
					.getAddress(selfId).getSelfName();
		} finally {
			platform.releaseState();
		}

		console.out.println("Winter is coming, " + myName + "!");

		// create a transaction. For this example app,
		// we will define each transactions to simply
		// be a string in UTF-8 encoding.
		String[] alliances;
		String[] families;
		String[] connections_families_to_alliance;

		try {
			GameOfThronesDemoState state = (GameOfThronesDemoState) platform.getState();
			alliances = state.getAlliances();
			families = state.getFamilies();
			connections_families_to_alliance = state.getConnect_families_to_alliance();
		} finally {
			platform.releaseState();
		}

		console.out.println("Alliances: " + String.join(", ", alliances));
		console.out.println("Families: " + String.join(", ", families));
		console.out.println("Connections Families to Alliance: " + String.join(", ", connections_families_to_alliance));

		Random rand = new Random();
		int family_index = rand.nextInt(families.length);
		byte[] transaction = families[family_index].getBytes(StandardCharsets.UTF_8);
		console.out.println("family in txn: " + families[family_index]);
		console.out.println(("transaction: " + transaction));

		// Send the transaction to the Platform, which will then
		// forward it to the State object.
		// The Platform will also send the transaction to
		// all the other members of the community during syncs with them.
		// The community as a whole will decide the order of the transactions
		platform.createTransaction(new Transaction(transaction));
		//String lastReceived = "";
		String[] lastReceivedConnections_families_to_alliance = new String[]{};

		while (true) {
			String[] receivedConnections_families_to_alliance;
			try {
				GameOfThronesDemoState state = (GameOfThronesDemoState) platform.getState();
				//received = state.getReceived();
				receivedConnections_families_to_alliance = state.getConnect_families_to_alliance();
			} finally {
				platform.releaseState();
			}

			if (!Arrays.deepEquals(lastReceivedConnections_families_to_alliance, receivedConnections_families_to_alliance)) {
				//lastReceivedConnections_families_to_alliance = receivedConnections_families_to_alliance;
				lastReceivedConnections_families_to_alliance = Arrays.copyOf(receivedConnections_families_to_alliance, receivedConnections_families_to_alliance.length);
				//console.out.println("Received Connections Families to Alliance: " + String.join(", ", receivedConnections_families_to_alliance)); // print all received transactions
				console.out.println("Received Connections Families to Alliance: ");
				for(int i = 0; i < receivedConnections_families_to_alliance.length; i++) {
					console.out.println(receivedConnections_families_to_alliance[i]);
				}
				console.out.println("");
			}

			try {
				Thread.sleep(sleepPeriod);
			} catch (Exception e) {
			}
		}
	}

	@Override
	public SwirldState newState() {
		return new GameOfThronesDemoState();
	}

	@Override
	public void platformStatusChange(PlatformStatus newStatus) {
	}
}