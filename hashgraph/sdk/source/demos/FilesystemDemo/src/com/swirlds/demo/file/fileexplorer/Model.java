package com.swirlds.demo.file.fileexplorer;

import com.swirlds.fs.Header;

import java.util.List;

;

interface Model {
	List<String> ls(String path);

	byte[] getHash(String path);

	boolean isDir(String path);

	void mkdir(String path);

	void cp(String srcpath, String destpath);

	void rm(String path);

	void exportRec(String entity, String physDest);

	void importRec(String phys, String dest);
}