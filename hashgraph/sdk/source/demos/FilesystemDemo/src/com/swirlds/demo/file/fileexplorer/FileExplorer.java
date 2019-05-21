package com.swirlds.demo.file.fileexplorer;

import com.swirlds.fs.FCFileSystem;

import javax.swing.JDialog;
import javax.swing.JFrame;
import javax.swing.WindowConstants;
import java.awt.Window;

public class FileExplorer extends JDialog
		implements FileExplorerPanel.FileChoiceListener {
	private static final long serialVersionUID = 1L;

	/** Opens a JFrame to explore the local, non-shared, <code>fs</code> */
	public static void exploreLocal(FCFileSystem fs) {
		explore1(fs, FileExplorerPanel.ExplorerPolicy.YES);
	}

	/**
	 * Open a JFrame to explore <code>fs</code>, which is a filesystem shared
	 * with other nodes.
	 */
	public static void exploreShared(FCFileSystem fs) {
		explore1(fs, FileExplorerPanel.ExplorerPolicy.YES_IMMUTABLY);
	}

	private static void explore1(FCFileSystem fs,
			FileExplorerPanel.ExplorerPolicy pol) {
		JFrame f = new JFrame("Explore");
		f.getContentPane().add(
				new FileExplorerPanel(new RealModel(fs),
						FileExplorerPanel.ChooserPolicy.NULL,
						pol));
		f.setDefaultCloseOperation(WindowConstants.DISPOSE_ON_CLOSE);
		showWindow(f);
	}

	/**
	 * Opens a JDialog to choose an existing entity from <code>fs</code>
	 * or to specify a new one.
	 *
	 * @param chooseNew
	 * 		false to specify selection of an existing entity
	 * @return a pathname, or null if cancelled
	 */
	// TODO should probably not allow creating directories in a shared filesystem
	public static String choose(JFrame owner, FCFileSystem fs, boolean chooseNew) {
		FileExplorer d = new FileExplorer(owner, fs, chooseNew);
		d.setDefaultCloseOperation(WindowConstants.DISPOSE_ON_CLOSE);
		showWindow(d);
		return d.path;
	}

	private static void showWindow(Window w) {
		w.pack();
		w.setVisible(true);
	}

	private String path;

	private FileExplorer(JFrame owner, FCFileSystem fs, boolean chooseNew) {
		super(owner, chooseNew ? "Save" : "Open", true);
		setModalityType(ModalityType.DOCUMENT_MODAL);
		getContentPane().add(
				new FileExplorerPanel(
						new RealModel(fs),
						new FileExplorerPanel.ChooserPolicy(this, chooseNew),
						FileExplorerPanel.ExplorerPolicy.NO));
	}

	public void fileChosen(String path) {
		this.path = path;
		dispose();
	}
}
