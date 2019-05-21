package com.swirlds.demo.file.fileexplorer;

import javax.swing.BoxLayout;
import javax.swing.DefaultComboBoxModel;
import javax.swing.JButton;
import javax.swing.JComboBox;
import javax.swing.JFileChooser;
import javax.swing.JLabel;
import javax.swing.JOptionPane;
import javax.swing.JPanel;
import javax.swing.JScrollPane;
import javax.swing.JTable;
import javax.swing.JTextField;
import javax.swing.ListSelectionModel;
import javax.swing.event.DocumentEvent;
import javax.swing.event.DocumentListener;
import javax.swing.event.ListSelectionEvent;
import javax.swing.table.DefaultTableModel;
import java.awt.event.ActionEvent;
import java.awt.event.KeyAdapter;
import java.awt.event.KeyEvent;
import java.awt.event.MouseAdapter;
import java.awt.event.MouseEvent;
import java.io.File;
import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.Vector;
import java.util.function.Consumer;

public class FileExplorerPanel extends JPanel implements DocumentListener {
	/*
	 * select items in dirent list copy selection to filename textbox "OK" button
	 * is only enabled when textbox has something in it double clicking a dirent
	 * or pressing enter on it can act as it already does (it's fine to do nothing
	 * if selection is not a dir) whenever you listDir, clear the textbox
	 */

	/*
	 * minor UI bug dirs combobox shows check marks against both d1's in
	 * "/d1/x/d1". this must be a bug in Java's Swing library. It should only show
	 * a check mark against the item at selected index, not against items that
	 * equal() selected item.
	 */

	public static interface FileChoiceListener {
		void fileChosen(String path);
	}

	public static class ChooserPolicy {
		public static final ChooserPolicy NULL = new ChooserPolicy((p) -> {
		}, true);
		FileChoiceListener listener;
		boolean chooseNew;

		public ChooserPolicy(FileChoiceListener l, boolean chooseNew) {
			this.listener = l;
			this.chooseNew = chooseNew;
		}
	}

	public static enum ExplorerPolicy {
		NO, YES_IMMUTABLY, YES
	}

	;

	private static final long serialVersionUID = 1L;

	private static final Object[] COLUMN_NAMES = new Object[] { "name", "type" };

	private Model model;
	private ChooserPolicy chooserPolicy;
	private ExplorerPolicy explorerPolicy;

	private JPanel filenamePanel;
	private JComboBox<String> dirs;
	private DefaultComboBoxModel<String> dirModel;
	private JTable dirents;
	private DefaultTableModel direntModel;
	private JTextField filename;
	private JButton okButton;

	public FileExplorerPanel(Model model, ChooserPolicy pol,
			ExplorerPolicy explore) {
		this.model = model;
		this.chooserPolicy = pol;
		this.explorerPolicy = explore;
		build();
		listDir();

		explorePanel.setVisible(!explorerPolicy.equals(ExplorerPolicy.NO));
		boolean showChooserWidgets = !chooserPolicy.equals(ChooserPolicy.NULL);
		okButton.setVisible(showChooserWidgets);
		filenamePanel.setVisible(showChooserWidgets);
	}

	private void build() {
		buildFilename();
		buildDirs();
		buildDirButtons();
		buildMgmtButtons();
		buildDirents();
		buildFinishedButtons();
		setLayout();
	}

	private void buildFilename() {
		filenamePanel = new JPanel();
		filenamePanel.add(new JLabel("Filename"));
		filename = new JTextField(30);
		filename.setEditable(chooserPolicy.chooseNew);
		filename.getDocument().addDocumentListener(this);
		filenamePanel.add(filename);
		if (chooserPolicy.chooseNew) // new rule: only show panel in "save" mode
			add(filenamePanel);
	}

	private void buildDirs() {
		dirModel = new DefaultComboBoxModel<>(new String[] { "<root>" });
		dirs = new JComboBox<>(dirModel);
		dirs.addActionListener(this::dirsComboAction);
		// add(dirs);
	}

	private void buildDirButtons() {
		JPanel dirButtons = new JPanel();
		JButton refreshButton = new JButton("refresh directory");
		refreshButton.addActionListener((e) -> listDir());
		dirButtons.add(refreshButton);
		// if (chooserPolicy.chooseNew) {
		// JButton newDirButton = new JButton("new subdirectory...");
		// newDirButton.addActionListener(this::newDir);
		// dirButtons.add(newDirButton);
		// }
		add(dirButtons);
	}

	private void buildDirents() {
		direntModel = new DefaultTableModel(COLUMN_NAMES, 0) {
			private static final long serialVersionUID = 1L;

			public boolean isCellEditable(int row, int column) {
				return false;
			}
		};
		dirents = new JTable(direntModel);
		dirents.setSelectionMode(ListSelectionModel.SINGLE_SELECTION);
		dirents.setAutoCreateRowSorter(true);
		dirents.getSelectionModel()
				.addListSelectionListener(this::direntSelectionChanged);
		dirents.addMouseListener(new MouseAdapter() {
			public void mouseClicked(MouseEvent e) {
				mouseClicked1(e);
			}
		});
		dirents.addKeyListener(new KeyAdapter() {
			public void keyPressed(KeyEvent e) {
				keyPressed1(e);
			}

			public void keyReleased(KeyEvent e) {
				keyReleased1(e);
			}
		});
		JScrollPane direntPane = new JScrollPane(dirents);
		add(direntPane);
	}

	private void buildFinishedButtons() {
		okButton = new JButton("OK");
		okButtonEnablement();
		okButton.addActionListener(this::ok);
		add(okButton);
	}

	private void setLayout() {
		setLayout(new BoxLayout(this, BoxLayout.Y_AXIS));
	}

	public void insertUpdate(DocumentEvent e) {
		okButtonEnablement();
	}

	public void removeUpdate(DocumentEvent e) {
		okButtonEnablement();
	}

	public void changedUpdate(DocumentEvent e) {
	}

	public void okButtonEnablement() {
		okButton.setEnabled(!filename.getText().equals(""));
	}

	void dirsComboAction(ActionEvent e) {
		popDirs();
		listDir();
	}

	void listDir() {
		List<String> pathComponents = dirPathComponents();
		String path = printPath(pathComponents);
		List<String> listing = model.ls(path);
		Object[][] tab = new Object[listing.size()][];
		for (int i = 0; i < tab.length; i++) {
			String entry = listing.get(i);
			Object[] row = new Object[2];
			row[0] = entry;
			row[1] = model.isDir(path + '/' + entry) ? "dir" : "file";
			tab[i] = row;
		}
		direntModel.setDataVector(tab, COLUMN_NAMES);
	}

	void newDir(ActionEvent e) {
		operate(model::mkdir);
	}

	void direntSelectionChanged(ListSelectionEvent e) {
		if (e.getValueIsAdjusting())
			return;
		direntSelectionChanged1(selectedDirent());
	}

	private void direntSelectionChanged1(Vector<Object> dirent) {
		updateFilename(dirent);
		updateDirentButtons(dirent);
	}

	private void updateFilename(Vector<Object> dirent) {
		filename.setText(dirent == null ? "" : (String) dirent.elementAt(0));
	}

	void mouseClicked1(MouseEvent e) {
		if (e.getButton() == MouseEvent.BUTTON1 && e.getClickCount() == 2) {
			descend();
			e.consume();
		}
	}

	void keyPressed1(KeyEvent e) {
		if (isEnterKey(e))
			e.consume();
	}

	void keyReleased1(KeyEvent e) {
		if (isEnterKey(e)) {
			descend();
			e.consume();
		}
	}

	// private void descendInto(String dir) {
	// int index = direntIndexOf(dir);
	// if (index >= 0) {
	// dirents.getSelectionModel().setSelectionInterval(index, index);
	// descend();
	// }
	// }

	private void descend() {
		descendInto(selectedDirent());
	}

	private void descendInto(Vector<Object> dirent) {
		if (dirent != null && ((String) dirent.elementAt(1)).equals("dir")) {
			dirModel.insertElementAt((String) dirent.elementAt(0), 0);
			dirs.setSelectedIndex(0);
		}
	}

	void ok(ActionEvent e) {
		chooserPolicy.listener.fileChosen(printablePath(filename.getText()));
	}

	private void popDirs() {
		int index = dirs.getSelectedIndex();
		for (int i = 0; i < index; i++)
			dirModel.removeElementAt(0);
	}

	private String printablePath(String lastComponent) {
		return printPath(append1(dirPathComponents(), lastComponent));
	}

	private List<String> dirPathComponents() {
		List<String> path = new LinkedList<>();
		int size = dirModel.getSize();
		for (int i = size - 2; i >= 0; i--)
			path.add(dirModel.getElementAt(i));
		return path;
	}

	@SuppressWarnings("unchecked")
	private Vector<Object> selectedDirent() {
		int index = dirents.getSelectedRow();
		return (index == -1)
				? null
				: (Vector<Object>) (direntModel.getDataVector().elementAt(index));
	}

// private int direntIndexOf(String filename) {
// Vector rows = direntModel.getDataVector();
// for (int i = 0; i < rows.size(); i++)
// if (((String) (((Vector) rows.elementAt(i)).elementAt(0)))
// .equals(filename))
// return i;
// return -1;
// }

	private static boolean isEnterKey(KeyEvent e) {
		return e.getKeyCode() == KeyEvent.VK_ENTER;
	}

	private void operate(Consumer<String> op) {
		String name = JOptionPane.showInputDialog(this, "name");
		if (name == null)
			return;
		String path = printablePath(name);
		if (model.getHash(path) == null) {
			op.accept(path);
			listDir();
		} else {
			message("\"%s\" already exists", name);
			operate(op);
		}
	}

	void message(String fmt, Object... args) {
		JOptionPane.showMessageDialog(this, String.format(fmt, args));
	}

	static List<String> append1(List<String> list, String element) {
		List<String> result = new LinkedList<>(list);
		result.add(element);
		return result;
	}

	/* new features here, related to dirent actions */

	private JPanel explorePanel;
	private Map<String, JButton> dButtons = new HashMap<>();
	static final String[] direntButtons = { "rename", "delete", "copy" };// , "export" };
	static final String[] mutatingButtons = { "rename", "delete", "copy", "paste",
			"import" };

	private void buildMgmtButtons() {
		explorePanel = new JPanel();
		add(explorePanel);
		Object[][] spec = new Object[][] {
				{ "rename...", "rename", identity(this::rename) },
				{ "delete", "delete", identity(this::delete) },
				{ "copy", "copy", identity(this::copy) },
				// { "export...", "export", identity(this::export) },
				{ "paste into this directory...", "paste", identity(this::paste) },
				{ "import into this directory...", "import", identity(this::import1) }, };
		for (Object[] s : spec)
			buildMgmtButton(explorePanel, (String) s[0], (String) s[1],
					(Runnable) s[2]);
		updateDirentButtons(null);
		pasteBufChanged();
		for (String b : mutatingButtons)
			dButtons.get(b)
					.setVisible(!explorerPolicy.equals(ExplorerPolicy.YES_IMMUTABLY));
	}

	private Runnable identity(Runnable r) {
		return r;
	}

	private void buildMgmtButton(JPanel p, String label, String name,
			Runnable action) {
		JButton b = new JButton(label);
		b.addActionListener((e) -> action.run());
		p.add(b);
		dButtons.put(name, b);
	}

	void rename() {
		operate((path) -> rename1(selectedPath(), path));
	}

	// only for use when selection is known to be non-null
	private String selectedPath() {
		return printablePath((String) selectedDirent().elementAt(0));
	}

	private void rename1(String srcpath, String destpath) {
		model.cp(srcpath, destpath);
		model.rm(srcpath);
	}

	void delete() {
		model.rm(selectedPath());
		listDir();
	}

	String pasteBuf;

	void setPasteBuf(String p) {
		this.pasteBuf = p;
		pasteBufChanged();
	}

	void pasteBufChanged() {
		dButtons.get("paste").setEnabled(pasteBuf != null);
	}

	void copy() {
		setPasteBuf(selectedPath());
	}

	void paste() {
		if (model.getHash(pasteBuf) != null)
			operate((path) -> {
				model.cp(pasteBuf, path);
				setPasteBuf(null);
			});
		else
			message("\"%s\" no longer exists", pasteBuf);
	}

	void import1() {
		extFileChooser.setFileSelectionMode(JFileChooser.FILES_AND_DIRECTORIES);
		if (extFileChooser.showOpenDialog(this) == JFileChooser.APPROVE_OPTION)
			operate((path) -> model
					.importRec(asLispPath(extFileChooser.getSelectedFile()), path));
	}

	JFileChooser extFileChooser = new JFileChooser();

// void export() {
// EntityType type = (EntityType) selectedDirent().elementAt(1);
// extFileChooser.setFileSelectionMode(type.equals(EntityType.DIR)
// ? JFileChooser.DIRECTORIES_ONLY
// : (type.equals(EntityType.FILE)
// ? JFileChooser.FILES_ONLY
// : JFileChooser.FILES_AND_DIRECTORIES));
// int choice = extFileChooser.showSaveDialog(this);
// if (choice == JFileChooser.APPROVE_OPTION) {
// File f = extFileChooser.getSelectedFile();
// if (f.exists()) {
// message("\"%s\" already exists", f.getAbsolutePath());
// export();
// } else {
// boolean dir = type.equals(EntityType.DIR);
// model.exportRec(selectedPath(), asLispPath(f) + (dir ? "/" : ""));
// }
// }
// }

	private void updateDirentButtons(Vector<Object> dirent) {
		boolean enable = dirent != null;
		for (String b : direntButtons)
			dButtons.get(b).setEnabled(enable);
	}

	// we want the trailing "/" on existing directories
	// toURI() calls the private File.slashify(), which appends such a /
	// provided the directory exists
	// TODO: not yet intended for windows shares or anything like that
	static String asLispPath(File f) {
		return f.toURI().toString().substring("file:".length());
	}

	String printPath(List<String> path) {
		StringBuilder sb = new StringBuilder();
		sb.append('/');
		for (int i = 0; i < path.size(); i++) {
			sb.append(path.get(i));
			if (i < path.size() - 1) {
				sb.append('/');
			}
		}
		return sb.toString();
	}
}
